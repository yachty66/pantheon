from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os

app = FastAPI()

# Set up CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["https://pantheon.so", "https://www.pantheon.so"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Initialize Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key) if url and key else None

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get('/ping')
async def hello():
    return {'res': 'pong'}

@app.get("/api/events")
async def get_events():
    if not supabase:
        return {"error": "Supabase client not initialized"}
    
    response = supabase.table("resident_advisor").select("*").order('created_at', desc=True).limit(1).execute()
    if hasattr(response, 'error') and response.error:
        return {"error": str(response.error)}
    elif hasattr(response, 'data') and response.data:
        return {"data": response.data[0]}
    else:
        return {"error": "No data found or unexpected response structure"}