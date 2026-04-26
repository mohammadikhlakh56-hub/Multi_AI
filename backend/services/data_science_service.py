"""
Hybrid Data Science Engine
==========================
Layer 1  — LangChain + Groq: reads CSV schema and drafts the initial Python script.
Layer 1c — Microsoft AutoGen (ag2 / pyautogen 0.8.x):
             AssistantAgent (Coder)  <->  UserProxyAgent (Executor)
             AutoGen natively handles execution + auto-correction in subprocess.
Layer 3  — Artifact Parser: PNG -> base64, xlsx/csv -> download URL.
"""

import os
import uuid
import base64
import io
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import pandas as pd
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

# ── AutoGen (ag2 / classic pyautogen API) ─────────────────────────────────────
import autogen
from autogen import AssistantAgent, UserProxyAgent

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# ── AutoGen LLM config (routes Groq through the OpenAI-compatible endpoint) ───
def _get_autogen_llm_config() -> dict:
    return {
        "config_list": [
            {
                "model": "llama-3.1-8b-instant",
                "api_key": GROQ_API_KEY,
                "base_url": "https://api.groq.com/openai/v1",
                "api_type": "openai",   # Groq exposes an OpenAI-compatible REST API
            }
        ],
        "cache_seed": None,   # disable caching so every run is live
        "temperature": 0.1,
    }


# ── Result dataclass ──────────────────────────────────────────────────────────
@dataclass
class DataScienceResult:
    text_response: str
    has_data_visuals: bool = False
    chart_base64: Optional[str] = None
    downloadable_file: Optional[dict] = None
    execution_logs: str = ""


# ── Download registry (maps file_id → absolute path) ─────────────────────────
_download_registry: dict[str, Path] = {}


def register_download(file_path: Path) -> str:
    file_id = str(uuid.uuid4())
    _download_registry[file_id] = file_path
    return file_id


def get_download_path(file_id: str) -> Optional[Path]:
    return _download_registry.get(file_id)


# ══════════════════════════════════════════════════════════════════════════════
# LAYER 1a — Schema Reader (no LLM, pure pandas)
# ══════════════════════════════════════════════════════════════════════════════
def _read_csv_schema(csv_path: str) -> tuple[str, str]:
    df = pd.read_csv(csv_path)
    schema = df.dtypes.to_frame("dtype").reset_index()
    schema.columns = ["column", "dtype"]
    return schema.to_string(index=False), df.head(3).to_string(index=False)


# ══════════════════════════════════════════════════════════════════════════════
# LAYER 1b — Code Drafter (LangChain + Groq)
# ══════════════════════════════════════════════════════════════════════════════
def _draft_code(csv_path: str, work_dir: str, user_prompt: str) -> str:
    """
    Ask Groq via LangChain to produce a ready-to-run Python script that:
      - Reads the CSV from CSV_PATH
      - Answers the user's question with pandas/matplotlib/seaborn
      - Saves any chart as chart.png and processed data as cleaned_data.xlsx (in WORK_DIR)
      - Prints a short plain-text summary of findings
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set.")

    schema_str, sample_str = _read_csv_schema(csv_path)
    llm = ChatGroq(model="llama-3.1-8b-instant", api_key=GROQ_API_KEY, temperature=0.15)
    
    session_dir_absolute_path = work_dir.replace("\\", "/")

    system = SystemMessage(content=(
        "You are an expert Python data scientist. Output ONLY executable Python code — "
        "no markdown fences, no prose explanations. The script MUST:\n"
        "CRITICAL IMPORT RULE: You MUST begin your generated Python script by explicitly importing all required libraries. Always include `import os`, `import pandas as pd`, and `import matplotlib.pyplot as plt` at the very beginning of the code. If using the injected absolute paths, you can also just use the raw string paths directly (e.g., `plt.savefig('/absolute/path/chart.png')`).\n"
        "1. Import matplotlib and call `matplotlib.use('Agg')` as the very first lines.\n"
        "2. Read the CSV from the variable CSV_PATH (already defined before your code runs).\n"
        "3. Answer the user's question with pandas operations.\n"
        "4. NEVER call plt.show().\n"
        "5. Strict Rule for Pandas: When generating code to save Excel files using pd.ExcelWriter, you MUST use `writer.close()` or a `with pd.ExcelWriter(...) as writer:` context manager. DO NOT use `writer.save()` as it is deprecated and will cause a crash.\n"
        "6. Print a concise plain-text summary of the findings at the end.\n"
        f"Strict Rule: You must save the chart as EXACTLY '{session_dir_absolute_path}/chart.png' and the excel file as EXACTLY '{session_dir_absolute_path}/cleaned_data.xlsx'. Do not use relative paths or undefined variables like WORK_DIR.\n"
        "Only use: pandas, matplotlib, seaborn, openpyxl, os, pathlib. Nothing else."
    ))

    human = HumanMessage(content=(
        f"# Pre-defined variables (do NOT redefine):\n"
        f"# CSV_PATH = r\"{csv_path}\"\n"
        f"# WORK_DIR = r\"{work_dir}\"\n\n"
        f"# CSV Schema:\n{schema_str}\n\n"
        f"# Sample rows (first 3):\n{sample_str}\n\n"
        f"# User question: {user_prompt}\n\n"
        "Write the complete Python script now."
    ))

    response = llm.invoke([system, human])
    code = response.content.strip()

    # Strip any stray markdown fences the model may have added
    if code.startswith("```"):
        lines = code.split("\n")
        code = "\n".join(
            lines[1:-1] if lines[-1].strip() in ("```", "```python") else lines[1:]
        )
    return code


# ══════════════════════════════════════════════════════════════════════════════
# LAYER 1c — AutoGen Execution & Auto-Correction
# AssistantAgent (Coder) <-> UserProxyAgent (Executor / Sandbox)
# ══════════════════════════════════════════════════════════════════════════════
def _execute_with_autogen(
    initial_code: str,
    csv_path: str,
    work_dir: str,
    max_turns: int = 5,
) -> str:
    """
    Hand off the drafted code to AutoGen's two-agent collaboration:

      UserProxyAgent  →  sends code to AssistantAgent, runs it in subprocess sandbox.
      AssistantAgent  →  reviews execution errors and returns corrected code.

    AutoGen natively loops until the code runs successfully or max_turns is reached.
    Returns the captured stdout logs from the last successful execution.
    """
    llm_config = _get_autogen_llm_config()

    # ── The Coder: reviews errors and fixes code ──────────────────────────────
    coder = AssistantAgent(
        name="DataScience_Coder",
        llm_config=llm_config,
        system_message=(
            "You are an expert Python data scientist. "
            "When I provide a Python script, you must output it in a ```python ... ``` code block so I can execute it. "
            "If I provide an error output, fix the script and return the COMPLETE corrected script inside a single ```python ... ``` code block. "
            "CRITICAL RULE: You MUST start every single Python code block with the following exact imports. If you fail to do this, the system will crash:\n"
            "import os\n"
            "import pandas as pd\n"
            "import matplotlib.pyplot as plt\n"
            "The variables CSV_PATH and WORK_DIR are already defined in the execution scope — do NOT redefine them. "
            "Do NOT include the word TERMINATE when providing code. "
            "ONLY reply with exactly: TERMINATE after I report that execution succeeded (exitcode: 0)."
        ),
    )

    # ── The Executor: runs code in a timed subprocess sandbox ─────────────────
    executor = UserProxyAgent(
        name="DataScience_Executor",
        human_input_mode="NEVER",           # fully autonomous, no human prompts
        max_consecutive_auto_reply=max_turns,
        is_termination_msg=lambda msg: "TERMINATE" in (msg.get("content") or ""),
        code_execution_config={
            "work_dir": str(work_dir),           # isolated temp directory per session
            "use_docker": False,            # subprocess sandbox (Docker for production)
            "timeout": 30,                  # hard 30-second kill switch
            "last_n_messages": 3,           # only look at recent messages for code blocks
        },
        default_auto_reply="Execution complete.",
    )

    # ── Preamble injected before user code so CSV_PATH / WORK_DIR are always defined ──
    preamble = (
        "import matplotlib\nmatplotlib.use('Agg')\n"
        "import os, sys\n"
        f"CSV_PATH = r'{csv_path}'\n"
        f"WORK_DIR = r'{work_dir}'\n"
        f"os.chdir(r'{work_dir}')\n\n"
    )

    safe_imports = "import os\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n"
    if "import os" not in initial_code:
        initial_code = safe_imports + initial_code

    initial_message = (
        f"Please review and output the following Python data analysis script inside a Python code block so I can execute it.\n"
        f"Do NOT include TERMINATE. I will execute it and tell you the result.\n\n"
        f"```python\n{preamble}{initial_code}\n```"
    )

    # Capture AutoGen's console output (it prints extensively)
    log_buffer = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = log_buffer

    try:
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as thread_executor:
            future = thread_executor.submit(
                executor.initiate_chat,
                coder,
                message=initial_message,
                max_turns=max_turns,
            )
            # Hard 60-second timeout to prevent Fastapi worker from blocking forever
            future.result(timeout=60)
    except concurrent.futures.TimeoutError:
        print("[DS Engine Error] AutoGen conversation timed out (60s) and was aborted.")
        log_buffer.write("\n[DS Engine Error] AutoGen execution timed out and was killed to prevent hanging.\n")
    except Exception as e:
        print(f"[DS Engine Error] AutoGen execution failed: {str(e)}")
        log_buffer.write(f"\n[DS Engine Error] Execution failed: {str(e)}\n")
    finally:
        sys.stdout = old_stdout

    logs = log_buffer.getvalue()
    return logs


# ══════════════════════════════════════════════════════════════════════════════
# LAYER 3 — Artifact Parser
# ══════════════════════════════════════════════════════════════════════════════
def _parse_artifacts(work_dir: str, uploaded_csv_name: str = "") -> tuple[Optional[str], Optional[dict]]:
    """
    Scan work_dir (and any subdirectories AutoGen may use, e.g. 'coding/')
    for generated PNG images and Excel/CSV files.
    """
    import os
    import glob
    
    chart_base64 = None
    downloadable_file = None

    # EXACT PATH RESOLUTION & ROBUST SCANNING
    # Find the PNG
    image_files = glob.glob(os.path.join(work_dir, "*.png"))
    if not image_files:
        image_files = glob.glob(os.path.join(work_dir, "**", "*.png"), recursive=True)
        
    if image_files:
        with open(image_files[0], "rb") as img_file:
            encoded_string = base64.b64encode(img_file.read()).decode('utf-8')
            chart_base64 = f"data:image/png;base64,{encoded_string}"

    # Find xlsx/csv
    excel_files = glob.glob(os.path.join(work_dir, "*.xlsx")) + glob.glob(os.path.join(work_dir, "*.csv"))
    if not excel_files:
        excel_files = glob.glob(os.path.join(work_dir, "**", "*.xlsx"), recursive=True) + glob.glob(os.path.join(work_dir, "**", "*.csv"), recursive=True)

    for dl in excel_files:
        file_path = Path(dl)
        if file_path.name == uploaded_csv_name or file_path.suffix == ".py":
            continue
        file_id = register_download(file_path)
        downloadable_file = {"filename": file_path.name, "url": f"/api/downloads/{file_id}"}
        break

    print(f"--- DEBUG INFO ---")
    print(f"Looking in directory: {work_dir}")
    print(f"Files currently in directory: {os.listdir(work_dir)}")
    print(f"------------------")

    return chart_base64, downloadable_file


# ══════════════════════════════════════════════════════════════════════════════
# HELPER — Extract clean script stdout from AutoGen logs
# ══════════════════════════════════════════════════════════════════════════════
def _extract_script_output(autogen_logs: str) -> str:
    """
    AutoGen wraps subprocess output like:
        >>>>>>>> EXECUTING CODE BLOCK (inferred language is python)...
        exitcode: 0 (execution succeeded)
        Code output: <actual print() output here>

    This function extracts only the real script stdout (the 'Code output:' section)
    and returns it as the human-readable text response.
    """
    import re

    # Strategy 1: grab everything after 'Code output:' blocks
    code_output_blocks = re.findall(
        r"Code output:\s*\n(.*?)(?=\n\n[A-Z]|\nDataScience_|\Z)",
        autogen_logs,
        re.DOTALL,
    )
    if code_output_blocks:
        combined = "\n".join(block.strip() for block in code_output_blocks if block.strip())
        if combined:
            return combined

    # Strategy 2: lines after 'exitcode: 0' that are actual print output
    output_lines = []
    capturing = False
    for line in autogen_logs.split("\n"):
        if line.startswith("exitcode:") and "execution succeeded" in line:
            capturing = True
            continue
        if capturing:
            # Stop at the next AutoGen agent message marker
            if line.startswith("DataScience_") or line.startswith(">>>>>>") or line.startswith("------"):
                break
            if line.strip():
                output_lines.append(line)

    if output_lines:
        return "\n".join(output_lines).strip()

    return "Analysis completed successfully."


# ══════════════════════════════════════════════════════════════════════════════
# PUBLIC ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════
def run_data_science_pipeline(
    csv_path: str,
    user_prompt: str,
    session_id: Optional[str] = None,
) -> DataScienceResult:
    """
    Full 3-layer pipeline:
      1a. Read CSV schema (pandas)
      1b. Draft Python script (LangChain + Groq)
      1c. Execute + auto-correct via AutoGen (AssistantAgent <-> UserProxyAgent)
      3.  Parse artifacts → structured JSON response
    """
    sid = session_id or str(uuid.uuid4())
    temp_root = Path(__file__).parent.parent / "temp"
    work_dir = temp_root / sid
    work_dir.mkdir(parents=True, exist_ok=True)

    try:
        # ── Layer 1b: LangChain drafts the code ────────────────────────────
        print(f"[DS Engine] Drafting code for session {sid}...")
        initial_code = _draft_code(csv_path, str(work_dir), user_prompt)

        # ── Layer 1c: AutoGen executes + self-corrects ─────────────────────
        print(f"[DS Engine] Handing off to AutoGen (AssistantAgent <-> UserProxyAgent)...")
        autogen_logs = _execute_with_autogen(
            initial_code, csv_path, str(work_dir), max_turns=5
        )

        # ── Extract clean text summary from subprocess stdout only ──────────
        text_response = _extract_script_output(autogen_logs)

        # ── Layer 3: Parse artifacts (scan work_dir + subdirs) ───────────────
        chart_b64, dl_file = _parse_artifacts(str(work_dir), Path(csv_path).name)

        return DataScienceResult(
            text_response=text_response,
            has_data_visuals=chart_b64 is not None,
            chart_base64=chart_b64,
            downloadable_file=dl_file,
            execution_logs=autogen_logs[:4000],  # truncate for JSON safety
        )

    except Exception as exc:
        import traceback
        tb = traceback.format_exc()
        print(f"[DS Engine] Pipeline error: {tb}")
        return DataScienceResult(
            text_response=f"I encountered an error during analysis: {str(exc)}",
            has_data_visuals=False,
            execution_logs=tb,
        )
