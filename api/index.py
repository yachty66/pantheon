from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from openai import AsyncOpenAI
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
if not url or not key:
    logger.error("Supabase URL or Key not found in environment variables")
supabase: Client = create_client(url, key) if url and key else None

# Initialize OpenAI client
openai_api_key = os.environ.get("OPENAI_API_KEY")
if not openai_api_key:
    logger.error("OpenAI API Key not found in environment variables")
client = AsyncOpenAI(api_key=openai_api_key)

@app.get("/api/events")
async def get_events():
    logger.info("Received request for /api/events")
    if not supabase:
        logger.error("Supabase client not initialized")
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    try:
        response = supabase.table("resident_advisor").select("*").order('created_at', desc=True).limit(1).execute()
        logger.info(f"Supabase response: {response}")
        if hasattr(response, 'error') and response.error:
            logger.error(f"Supabase error: {response.error}")
            raise HTTPException(status_code=500, detail=str(response.error))
        elif hasattr(response, 'data') and response.data:
            logger.info("Successfully retrieved data from Supabase")
            return {"data": response.data[0]}
        else:
            logger.error("No data found or unexpected response structure")
            raise HTTPException(status_code=500, detail="No data found or unexpected response structure")
    except Exception as e:
        logger.error(f"Exception occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ask")
async def ask(req: dict):
    logger.info("Received request for /api/ask with data: %s", req)
    try:
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
    except Exception as e:
        logger.error(f"Exception occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))