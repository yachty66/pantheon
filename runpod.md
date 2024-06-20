!pip install aiohttp aiofiles

import aiohttp
import aiofiles
import gzip
import shutil
import json
import calendar
import subprocess
import os
import asyncio
from aiohttp import ClientTimeout
from concurrent.futures import ThreadPoolExecutor

#it seems to be quite quick to get to the point o

async def download_file(session, url, local_filename, retries=3):
    """Asynchronously download a file from a specified URL and save it locally with retry mechanism."""
    timeout = ClientTimeout(total=60*5)  # 5 minutes total timeout
    attempt = 0
    while attempt < retries:
        try:
            async with session.get(url, timeout=timeout) as response:
                if response.status == 200:
                    content = await response.read()  # Read the whole content at once
                    async with aiofiles.open(local_filename, 'wb') as f:
                        await f.write(content)
                    print(f"Downloaded {local_filename}")
                    return True
                else:
                    print(f"Failed to download {local_filename}, status: {response.status}")
        except (aiohttp.ClientPayloadError, aiohttp.ClientConnectionError, asyncio.TimeoutError) as e:
            print(f"Attempt {attempt + 1} failed with error: {e}")
            if attempt < retries - 1:
                await asyncio.sleep(2**attempt)  # Exponential backoff
            else:
                print(f"Failed to download {local_filename} after {retries} attempts")
        attempt += 1
    return False

async def download_and_combine_day_data(year, month, day, session):
    """Asynchronously download all hourly data files for a specific day and combine them into a single file."""
    base_url = "https://data.gharchive.org/"
    day_folder = f"{year}-{month:02d}-{day:02d}"
    combined_filename = f"{year}-{month:02d}-{day:02d}.json"
    full_path = os.path.join(day_folder, combined_filename)
    
    os.makedirs(day_folder, exist_ok=True)
    
    tasks = []
    for hour in range(24):
        url = f"{base_url}{year}-{month:02d}-{day:02d}-{hour}.json.gz"
        local_filename = os.path.join(day_folder, f"{year}-{month:02d}-{day:02d}-{hour}.json.gz")
        task = asyncio.create_task(download_file(session, url, local_filename))
        tasks.append(task)
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    if any(isinstance(result, Exception) for result in results):
        print(f"Failed to download some files for {day_folder}. Skipping this date.")
        return False
    
    with open(full_path, 'wb') as f_out:
        for hour in range(24):
            gz_filename = os.path.join(day_folder, f"{year}-{month:02d}-{day:02d}-{hour}.json.gz")
            if os.path.exists(gz_filename):  # Check if the file exists before opening
                with gzip.open(gz_filename, 'rb') as f_in:
                    shutil.copyfileobj(f_in, f_out)
            else:
                print(f"File {gz_filename} does not exist, skipping.")
    return True

async def download_month_data(year, month, session):
    """Asynchronously download data for each day of a month."""
    days_in_month = calendar.monthrange(year, month)[1]
    tasks = [download_and_combine_day_data(year, month, day, session) for day in range(1, days_in_month + 1)]
    await asyncio.gather(*tasks)

def extract_actor_urls(input_filename, output_directory, year, month):
    """Extract actor URLs from a JSON file and append them to a file in the specified directory."""
    output_filename = os.path.join(output_directory, f"{year}-{month:02d}-actor-urls.txt")
    actor_urls = set()
    with open(input_filename, 'r') as infile:
        for line in infile:
            try:
                event = json.loads(line)
                if 'actor' in event and 'url' in event['actor']:
                    actor_urls.add(event['actor']['url'])
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")

    os.makedirs(output_directory, exist_ok=True)
    with open(output_filename, 'a') as outfile:
        for url in actor_urls:
            outfile.write(url + '\n')

def cleanup_files(day_folder):
    """Delete all files in the specified day folder and the folder itself."""
    try:
        if os.path.exists(day_folder):
            shutil.rmtree(day_folder)  # This removes the directory and all its contents
            print("Folder cleaned up.")
        else:
            print("Folder does not exist.")
    except Exception as e:
        print(f"Error during file deletion: {e}")

import asyncio
import aiohttp
import nest_asyncio
nest_asyncio.apply()

async def main():
    start_year = 2020
    end_year = 2024
    output_directory = "github"

    # Initialize start_month to 10 for the first run
    initial_start_month = 5
    end_month = 5  # Set to May for the final year

    # Create a session using aiohttp's ClientSession
    async with aiohttp.ClientSession() as session:
        for year in range(start_year, end_year + 1):
            # Determine the start month for the current year
            if year == start_year:
                start_month = initial_start_month
            else:
                start_month = 1

            for month in range(start_month, 13 if year != end_year else end_month + 1):
                await download_month_data(year, month, session)  # Pass session to the function
                for day in range(1, calendar.monthrange(year, month)[1] + 1):
                    day_folder = f"{year}-{month:02d}-{day:02d}"
                    combined_filename = os.path.join(day_folder, f"{year}-{month:02d}-{day:02d}.json")
                    success = await download_and_combine_day_data(year, month, day, session)  # Pass session here
                    if success and os.path.exists(combined_filename):
                        extract_actor_urls(combined_filename, output_directory, year, month)
                        cleanup_files(day_folder)
                    else:
                        print(f"Skipping processing for {day_folder} due to download issues.")

await main()

#one way to do this really quick is if i start a online training of this - i think this would be kinda lets fucking do this. i just spin up 5 different machines on runpod and thna 
#need a pod for 20,21,22,23,24