import os
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

# Initialize supabase client. It will be None if keys are not provided.
supabase: Client | None = None

if url and key:
    supabase = create_client(url, key)

def get_db():
    if not supabase:
        raise Exception("Supabase is not configured. Please check SUPABASE_URL and SUPABASE_KEY environment variables.")
    return supabase
