import os

# =============================================
# WhatsApp Service - Twilio Integration Stub
# =============================================
# To activate real WhatsApp sending:
# 1. pip install twilio
# 2. Set environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
# =============================================

TWILIO_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM = os.environ.get("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")  # Twilio sandbox default


async def send_whatsapp_message(phone_number: str, message: str) -> dict:
    """Send a WhatsApp text message via Twilio."""
    if not TWILIO_SID or not TWILIO_TOKEN:
        print(f"[STUB] WhatsApp → {phone_number}: {message}")
        return {"status": "stub", "message": f"[STUB] Would send to {phone_number}: {message}"}

    try:
        from twilio.rest import Client
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        msg = client.messages.create(
            from_=TWILIO_FROM,
            to=f"whatsapp:{phone_number}",
            body=message,
        )
        return {"status": "sent", "sid": msg.sid}
    except Exception as e:
        return {"status": "error", "error": str(e)}


async def send_whatsapp_location(phone_number: str, latitude: float, longitude: float, label: str = "My Location") -> dict:
    """Send a location via WhatsApp (as Google Maps link since Twilio doesn't support native location)."""
    maps_url = f"https://maps.google.com/?q={latitude},{longitude}"
    message = f"📍 {label}\nLat: {latitude:.5f}, Lng: {longitude:.5f}\n{maps_url}"
    return await send_whatsapp_message(phone_number, message)
