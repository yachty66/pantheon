from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from openai import AsyncOpenAI
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pantheon.so", "https://www.pantheon.so", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key) if url and key else None

client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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
    
@app.post("/api/ask")
async def ask(req: dict):
    stream = await client.chat.completions.create(
        messages=req["messages"],
        model="gpt-3.5-turbo",
        stream=True,
    )

    async def generator():
        async for chunk in stream:
            yield chunk.choices[0].delta.content or ""

    response_messages = generator()
    return StreamingResponse(response_messages, media_type="text/event-stream")