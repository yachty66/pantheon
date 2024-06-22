from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()



app = FastAPI()

  # Set up CORS
app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://127.0.0.1:5500"],  # Adjust the origin as per your client URL
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
)

# Supabase setup
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@app.get("/events")
async def get_events():
    response = supabase.table("resident_advisor").select("*").execute()
    # Check if 'error' is an attribute in the response object
    if hasattr(response, 'error') and response.error:
        return {"error": str(response.error)}
    # Assuming 'data' is the correct attribute for fetched data
    elif hasattr(response, 'data'):
        return {"data": response.data}
    else:
        return {"error": "Unexpected response structure"}