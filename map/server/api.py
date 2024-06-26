"""
search queries:

what is the cheapest restaurant close to me?

1. make search query for finding the cheapest restaurants and list them all 
2. 

we need to define a set of APIs which an agent can take like cheapest restaurant endpoint and so on. basically an AI on top of this available endpoints 
"""
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


def get_cheapest_restaurants(current_location):
    """
    returns a list of all the cheapest restaurants in the area based on current location
    """
    

    pass


@app.get("/events")
async def get_events():
    response = supabase.table("resident_advisor").select("*").order('created_at', desc=True).limit(1).execute()
    if hasattr(response, 'error') and response.error:
        return {"error": str(response.error)}
    elif hasattr(response, 'data') and response.data:
        return {"data": response.data[0]}  # Return the first (and only) item
    else:
        return {"error": "No data found or unexpected response structure"}
