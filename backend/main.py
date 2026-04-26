from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uuid, os
from pathlib import Path

load_dotenv()

from services.llm_service import generate_response, generate_response_with_tools
from services.rag_service import generate_embedding
from services.whatsapp_service import send_whatsapp_message, send_whatsapp_location
from services.crew_service import run_research_crew
from services.data_science_service import run_data_science_pipeline, get_download_path
from database.db import get_db

app = FastAPI(title="Multi AI Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Pydantic Models ============

class ChatRequest(BaseModel):
    agent_id: str
    message: str
    session_id: str = "default_session"
    preview_prompt: Optional[str] = None

class ToolResultRequest(BaseModel):
    agent_id: str
    tool_name: str
    tool_args: dict
    tool_result: dict  # e.g. {"latitude": 33.6, "longitude": 73.1}

class AgentCreate(BaseModel):
    agent_name: str
    agent_type: str
    system_prompt: str
    model_choice: str = "llama-3.1-8b-instant"
    user_id: Optional[str] = None

class AgentUpdate(BaseModel):
    agent_name: Optional[str] = None
    agent_type: Optional[str] = None
    system_prompt: Optional[str] = None
    model_choice: Optional[str] = None

class CrewRequest(BaseModel):
    topic: str

# ============ Routes ============

@app.get("/")
def read_root():
    return {"message": "Multi AI Agent Server is running!", "version": "2.0"}

@app.get("/api/agents")
def get_agents():
    try:
        supabase = get_db()
        response = supabase.table("agents").select("*").order("created_at", desc=True).execute()
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database fetch failed: {str(e)}")

@app.get("/api/agents/{agent_id}")
def get_agent(agent_id: str):
    try:
        supabase = get_db()
        response = supabase.table("agents").select("*").eq("id", agent_id).single().execute()
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Agent not found: {str(e)}")

@app.post("/api/agents")
def create_agent(agent: AgentCreate):
    try:
        supabase = get_db()
        insert_data = {
            "agent_name": agent.agent_name,
            "agent_type": agent.agent_type,
            "system_prompt": agent.system_prompt,
            "model_choice": agent.model_choice
        }
        if agent.user_id:
            insert_data["user_id"] = agent.user_id

        response = supabase.table("agents").insert(insert_data).execute()
        agent_obj = response.data[0] if response.data else {}
        return {"message": "Agent saved successfully!", "agent": agent_obj, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")

@app.put("/api/agents/{agent_id}")
def update_agent(agent_id: str, updates: AgentUpdate):
    try:
        supabase = get_db()
        update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = supabase.table("agents").update(update_data).eq("id", agent_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Agent not found")
        return {"message": "Agent updated successfully!", "data": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update agent: {str(e)}")

@app.delete("/api/agents/{agent_id}")
def delete_agent(agent_id: str):
    try:
        supabase = get_db()
        supabase.table("agents").delete().eq("id", agent_id).execute()
        return {"message": "Agent deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete agent: {str(e)}")

@app.get("/api/logs/{agent_id}")
async def get_logs(agent_id: str):
    try:
        supabase = get_db()
        response = supabase.table("chat_logs").select("*").eq("agent_id", agent_id).order("created_at", desc=True).limit(50).execute()
        return {"data": response.data}
    except Exception as e:
        return {"data": [], "error": str(e)}

@app.post("/api/chat")
async def chat_with_agent(req: ChatRequest):
    try:
        supabase = get_db()

        if req.agent_id == "preview_agent":
            system_prompt = req.preview_prompt or "You are a helpful customer support agent."
            response_text = await generate_response(req.message, system_prompt)
            return {"reply": response_text}

        # Fetch agent from DB
        agent_resp = supabase.table("agents").select("system_prompt, model_choice").eq("id", req.agent_id).execute()
        if not agent_resp.data:
            raise Exception("Agent not found in database.")

        system_prompt = agent_resp.data[0]["system_prompt"]

        # RAG enrichment
        try:
            query_embed = await generate_embedding(req.message)
            rag_resp = supabase.rpc(
                "match_documents",
                {"query_embedding": query_embed, "match_count": 3, "filter_agent_id": req.agent_id}
            ).execute()
            if rag_resp.data:
                context_text = "\n\n".join(item["content"] for item in rag_resp.data)
                system_prompt += f"\n\nKnowledge Base Context:\n{context_text}"
        except Exception as rag_err:
            print("RAG skipped:", rag_err)

        # Generate response WITH tool calling
        result = await generate_response_with_tools(req.message, system_prompt)

        # Log to DB
        log_data = {
            "agent_id": req.agent_id,
            "user_message": req.message,
            "ai_response": result.get("reply") or result.get("confirmation") or "Tool action triggered"
        }
        try:
            supabase.table("chat_logs").insert(log_data).execute()
        except Exception:
            pass

        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/tool-result")
async def handle_tool_result(req: ToolResultRequest):
    """
    Called by frontend after executing a tool (e.g. after getting geolocation).
    Executes the tool server-side and returns a confirmation message.
    """
    try:
        result_message = ""

        if req.tool_name == "send_whatsapp_location":
            lat = req.tool_result.get("latitude")
            lng = req.tool_result.get("longitude")
            phone = req.tool_args.get("phone_number", "")
            label = req.tool_args.get("label", "My Location")
            result = await send_whatsapp_location(phone, lat, lng, label)
            result_message = f"✅ Location sent to {phone} via WhatsApp! ({label})"

        elif req.tool_name == "send_whatsapp_message":
            phone = req.tool_args.get("phone_number", "")
            message = req.tool_args.get("message", "")
            result = await send_whatsapp_message(phone, message)
            result_message = f"✅ Message sent to {phone} via WhatsApp!"

        else:
            result_message = f"Tool '{req.tool_name}' executed successfully."

        return {"reply": result_message}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_document(
    agent_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        content = await file.read()
        text_content = content.decode("utf-8")
        embedding = await generate_embedding(text_content)
        supabase = get_db()
        supabase.table("documents").insert({
            "agent_id": agent_id,
            "content": text_content,
            "embedding": embedding
        }).execute()
        return {"status": "success", "message": "Document ingested successfully"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/run-crew")
async def run_crew_endpoint(req: CrewRequest):
    """
    Executes a complex background task using the CrewAI pipeline.
    This does NOT replace or affect the real-time /api/chat endpoint.
    """
    try:
        import asyncio
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, run_research_crew, req.topic)
        return {"status": "success", "topic": req.topic, "result": result}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Crew execution failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 2: Data Science Router
# Accepts multipart/form-data: file (.csv) + prompt text + optional agent_id
# ─────────────────────────────────────────────────────────────────────────────

TEMP_DIR = Path(__file__).parent / "temp"
TEMP_DIR.mkdir(exist_ok=True)

@app.post("/api/data-science/chat")
async def data_science_chat(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    agent_id: str = Form(default="ds-agent"),
):
    """
    Layer 2 Router — accepts a CSV upload and a natural language prompt.
    Runs the Hybrid Engine (LangChain drafter + sandboxed subprocess executor)
    and returns a structured JSON with chart_base64, downloadable_file, etc.
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith((".csv", ".xlsx", ".xls")):
            raise HTTPException(status_code=400, detail="Only CSV or Excel files are accepted.")

        # Save uploaded file to a unique temp session folder
        session_id = str(uuid.uuid4())
        session_dir = TEMP_DIR / session_id
        session_dir.mkdir(parents=True, exist_ok=True)

        csv_path = session_dir / file.filename
        contents = await file.read()
        csv_path.write_bytes(contents)

        # Run the pipeline in a thread (blocking I/O + subprocess)
        import asyncio
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(
            None,
            run_data_science_pipeline,
            str(csv_path),
            prompt,
            session_id,
        )

        return {
            "text_response": result.text_response,
            "hasDataVisuals": result.has_data_visuals,
            "chart_base64": result.chart_base64,
            "downloadable_file": result.downloadable_file,
            "execution_logs": result.execution_logs,
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "text_response": "The Data Science Agent encountered a critical error during execution.",
            "hasDataVisuals": False,
            "execution_logs": f"Exception details: {str(e)}"
        }


@app.get("/api/downloads/{file_id}")
async def download_file(file_id: str):
    """
    Serve a generated artifact (xlsx, csv) by its registered file_id.
    The file_id is returned in the /api/data-science/chat response.
    """
    file_path = get_download_path(file_id)
    if not file_path or not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired.")
    return FileResponse(
        path=str(file_path),
        filename=file_path.name,
        media_type="application/octet-stream",
    )
