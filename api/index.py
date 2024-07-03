from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from typing import List
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from openai import AsyncOpenAI, OpenAI
import os
import logging
import json
from pydantic import BaseModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pantheon.so", "https://www.pantheon.so"],
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

tools = [
    {
        "type": "function",
        "function": {
            "name": "go_to_place_in_map",
            "description": "Go to a place in the map",
            "parameters": {
                "type": "object",
                "properties": {
                    "place": {
                        "type": "string",
                        "description": "The name of the place to navigate to.",
                    }
                },
                "required": ["place"],
            },
        },
    }
]

async def check_for_function_call(chat_conversation):
    client = OpenAI(api_key=openai_api_key)
    system=f"""
    You are a chatbot on top of a map. Your job is to help the user navigate the map. You can use the available functions to help you with this task.
    """
    #todo add option where user needs to provide more information in order for sucessfull function call
    user_content=f"""
    You are giving a chat conversation and based on this conversation you need to decide if an function from the available functions needs to be called. the available functions are:

    ---
    {tools}
    ---

    in the case a function can be called return the function name and the arguments that need to be passed to the function in JSON. Its important that the name of the key for the function name is `function_name` and the name of the key for the arguments is `arguments`. In the case a function cannot be called return an empty JSON object. Never append special characters like "\n\n" 

    Following the chat conversation:

    ---
    {chat_conversation}
    ---
    """
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        response_format={ "type": "json_object" },
        temperature=0.0,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_content}
        ]
    )
    response_content = completion.choices[0].message.content
    return response_content

#can i have to endpoints the first is checking if a function needs to get called and the
@app.post("/api/check_function_call")
async def check_function_call_endpoint(req: dict):
    #eitherk
    try:
        functions = await check_for_function_call(req)
        return {"functions": functions}
    except Exception as e:
        logger.error(f"Exception occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ask")
async def ask(req: dict):
    messages = req['messages']
    functions= req["functions"]
    try:
        system = """
        You are a chatbot on top of a map. Your job is to help the user navigate the map. You can use the available functions to help you with this task. 
        """
        user_content = f"""
        You are having a chat conversation and functions. The functions object is either empty, in which case no function is called, or it's not empty, in which case a function is called. Following is the functions object:

        {functions}

        Based on these functions and the following chat conversation, please provide a response. Following the chat conversation:

        ---
        {messages}
        ---
        """

        stream = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content}
            ],
            model="gpt-4-turbo",
            stream=True,
        )

        async def generator():
            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content

        # Create a StreamingResponse for the content
        streaming_response = StreamingResponse(generator(), media_type="text/plain")

        return streaming_response

    except Exception as e:
        logger.error(f"Exception occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))