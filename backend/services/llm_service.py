import os
import re
import asyncio
import json
from groq import AsyncGroq

groq_api_key = os.environ.get("GROQ_API_KEY")
client = AsyncGroq(api_key=groq_api_key) if groq_api_key else None

# ── Conversation behaviour injected into every system prompt ──────────────────
BEHAVIOUR_ADDENDUM = """

IMPORTANT CONVERSATION RULES (follow strictly):
- Talk like a friendly, helpful human — NOT a robot or script.
- Keep replies short and natural. Never use bullet-points unless the user specifically asks for a list.
- If the user says "nhi", "no", "nope", "nah", "theek hai", "ok bye", "band karo", or any goodbye/refusal — reply ONLY with "Theek hai, aapka din shubh ho! 😊" and do NOT continue the conversation or ask any more questions.
- Never repeat yourself or loop the same question.
- Do NOT use phrases like "humari saari services", "aapki madad karne ke liye taiyaar hoon" or similar robotic scripts.
- NEVER output raw function call syntax, JSON, or tool names in any message to the user.
- You are a chat assistant. Respond directly to the user in the chat window.
- DO NOT invoke external tools like `send_whatsapp_message` or `send_whatsapp_location` UNLESS the user explicitly asks you to 'send a message', 'text me', 'share my location', or 'WhatsApp me'.
- NEVER hallucinate or invent dummy phone numbers. If you need to use a tool but don't have the user's real phone number, you MUST ask the user for their phone number first in plain text.
"""

# Tool definitions for Groq Function Calling
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "send_whatsapp_location",
            "description": "Send the user's GPS location via WhatsApp to a phone number. CRITICAL: Use ONLY when the user explicitly asks to share/send their location via WhatsApp. Do NOT invent phone numbers. Ask the user for their number if missing.",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "The WhatsApp phone number with country code (e.g., +923001234567)"
                    },
                    "label": {
                        "type": "string",
                        "description": "Optional label for the location"
                    }
                },
                "required": ["phone_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_whatsapp_message",
            "description": (
                "Send a text message via WhatsApp to a phone number. "
                "CRITICAL RULES — you MUST follow all of these:\n"
                "1. ONLY invoke this tool when the user has EXPLICITLY asked to send a WhatsApp message.\n"
                "2. DO NOT guess, invent, or hallucinate phone numbers. "
                "Placeholders like '+91your_number', '+910000000000', or any obviously fake number are FORBIDDEN.\n"
                "3. If a real phone number (with valid country code and digits) is NOT present in the conversation, "
                "you MUST respond in plain text asking the user: 'Please share the phone number you want me to send this to.'\n"
                "4. Do NOT call this tool until the user provides a real number in their reply."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "The WhatsApp phone number with country code, e.g. +923001234567. Must be a real number provided by the user — not a placeholder."
                    },
                    "message": {
                        "type": "string",
                        "description": "The message content to send"
                    }
                },
                "required": ["phone_number", "message"]
            }
        }
    }
]

# ── Dummy phone number patterns the LLM hallucinates ────────────────────────
DUMMY_PHONE_PATTERNS = [
    re.compile(r'your[_\-]?number', re.IGNORECASE),
    re.compile(r'phone[_\-]?number', re.IGNORECASE),
    re.compile(r'^\+?0+$'),                          # all zeros
    re.compile(r'1234567'),                          # sequential digits
    re.compile(r'\+91[\s_-]?your', re.IGNORECASE),
    re.compile(r'\+?\d{1,3}(your|xxx|000|dummy)', re.IGNORECASE),
]

def is_dummy_phone(phone: str) -> bool:
    """Return True if the phone number looks hallucinated / invalid."""
    if not phone or len(phone.replace('+', '').replace(' ', '')) < 7:
        return True
    for pat in DUMMY_PHONE_PATTERNS:
        if pat.search(phone):
            return True
    return False


# ── Regex patterns to detect raw tool-call leakage in text responses ──────────
TOOL_LEAK_PATTERNS = [
    re.compile(r'\(function=\w+\>?\{.*?\}\}?', re.DOTALL),          # (function=name>{...}}
    re.compile(r'\{["\']\w+["\']:\s*\{.*?\}\}', re.DOTALL),          # {"function": {...}}
    re.compile(r'<function_calls>.*?</function_calls>', re.DOTALL),  # XML style
    re.compile(r'<tool_call>.*?</tool_call>', re.DOTALL),
    re.compile(r'\[TOOL_CALL\].*?\[/TOOL_CALL\]', re.DOTALL),
    re.compile(r'```json\s*\{.*?"name".*?\}.*?```', re.DOTALL),
    re.compile(r'send_whatsapp_\w+\s*\(.*?\)', re.DOTALL),          # bare function calls
]


def clean_leaked_tool_calls(text: str) -> str:
    """Strip any raw tool-call syntax that leaked into the text content."""
    for pattern in TOOL_LEAK_PATTERNS:
        text = pattern.sub('', text)
    return text.strip()


def has_tool_leak(text: str) -> bool:
    """Return True if the text appears to contain leaked tool-call syntax."""
    indicators = [
        'function=send_whatsapp',
        '"name": "send_whatsapp',
        "'name': 'send_whatsapp",
        '<function_calls>',
        '<tool_call>',
        'send_whatsapp_location(',
        'send_whatsapp_message(',
    ]
    lower = text.lower()
    return any(ind.lower() in lower for ind in indicators)


async def generate_response(user_message: str, system_prompt: str) -> str:
    """Simple text response — no tool calling."""
    if not client:
        await asyncio.sleep(0.3)
        return "I'm sorry, the AI backend is not configured yet."

    try:
        completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt + BEHAVIOUR_ADDENDUM},
                {"role": "user", "content": user_message}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.6,
            max_tokens=512,
        )
        return completion.choices[0].message.content or ""
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"


async def generate_response_with_tools(user_message: str, system_prompt: str) -> dict:
    """
    Generates a response with Groq function calling enabled.
    Returns:
      {"type": "text", "reply": "..."}   — normal reply
      {"type": "tool_call", "tool_name": ..., "tool_args": ..., "confirmation": ...}
    """
    if not client:
        return {"type": "text", "reply": "I'm sorry, the AI backend is not configured yet."}

    enriched_prompt = system_prompt + BEHAVIOUR_ADDENDUM

    try:
        completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": enriched_prompt},
                {"role": "user", "content": user_message}
            ],
            model="llama-3.1-8b-instant",
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.6,
            max_tokens=512,
        )

        choice = completion.choices[0]
        message = choice.message

        # ── Priority 1: proper structured tool_calls field ───────────────────
        if message.tool_calls and len(message.tool_calls) > 0:
            tool_call = message.tool_calls[0]
            tool_name = tool_call.function.name
            try:
                tool_args = json.loads(tool_call.function.arguments)
            except json.JSONDecodeError:
                tool_args = {}

            phone = tool_args.get("phone_number", "")

            # ── Guard: reject hallucinated / dummy phone numbers ─────────────
            if tool_name in ("send_whatsapp_message", "send_whatsapp_location") and is_dummy_phone(phone):
                return {
                    "type": "text",
                    "reply": "I need your real WhatsApp number to do that. Please share your phone number with country code (e.g. +923001234567) and I'll send it right away! 📱"
                }

            confirmations = {
                "send_whatsapp_location": f"Sure! I'll share your location to {phone} on WhatsApp now. 📍",
                "send_whatsapp_message": f"Got it! Sending the message to {phone} on WhatsApp now. 📤",
            }
            return {
                "type": "tool_call",
                "tool_name": tool_name,
                "tool_args": tool_args,
                "confirmation": confirmations.get(tool_name, "Let me handle that right away!")
            }

        # ── Priority 2: detect leaked tool-call text ─────────────────────────
        raw_text = message.content or ""
        if has_tool_leak(raw_text):
            # Model tried to call a tool but put it in text — parse it out
            # Try to find JSON args in the leaked text
            phone_match = re.search(r'"phone_number"\s*:\s*"([^"]+)"', raw_text)
            msg_match = re.search(r'"message"\s*:\s*"([^"]+)"', raw_text)
            name_match = re.search(r'send_whatsapp_(\w+)', raw_text)

            if name_match and phone_match:
                tool_name = f"send_whatsapp_{name_match.group(1)}"
                tool_args = {"phone_number": phone_match.group(1)}
                if msg_match:
                    tool_args["message"] = msg_match.group(1)
                return {
                    "type": "tool_call",
                    "tool_name": tool_name,
                    "tool_args": tool_args,
                    "confirmation": f"Handling that for you right now! 📱"
                }
            # If we can't parse, just clean and return as text
            cleaned = clean_leaked_tool_calls(raw_text)
            return {"type": "text", "reply": cleaned or "I'll take care of that for you!"}

        # ── Priority 3: normal text reply ────────────────────────────────────
        return {"type": "text", "reply": raw_text}

    except Exception as e:
        # Fallback to standard text generation if tool calling fails (e.g., 400 tool_use_failed)
        print(f"Tool call failed with error: {e}. Falling back to standard text response.")
        fallback_reply = await generate_response(user_message, system_prompt)
        return {"type": "text", "reply": fallback_reply}
