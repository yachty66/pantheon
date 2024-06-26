#### imports
import requests
import os
#from dotenv import load_dotenv
from bs4 import BeautifulSoup
import re
from supabase import create_client, Client

# Load environment variables from .env file
#load_dotenv()

# Mapbox API setup
MAPBOX_ACCESS_TOKEN = os.environ.get("MAPBOX_TOKEN")
MAPBOX_GEOCODING_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places/"

def main():
    url = "https://ra.co/events/us/sanfrancisco"
    proxy_username = os.environ.get("PROXY_USERNAME")
    proxy_password = os.environ.get("PROXY_PASSWORD")
    proxy_url = os.environ.get("PROXY_URL")
    test=os.environ.get("SUPABASE_URL")
    print("supabaseurl", test)
    print("proxy username", proxy_username)
    print("proxy password", proxy_password)
    print("proxy url", proxy_url)
    html_content_start_page = fetch_start_page(
        url, proxy_username, proxy_password, proxy_url
    )
    # with open("events.html", "w") as file:
    #     file.write(html_content_start_page)
    # print("html content start page", html_content_start_page)
    events = parse_events(html_content_start_page)
    print("events", events)
    event_details = fetch_event_details(
        events, proxy_username, proxy_password, proxy_url
    )
    print("event details", event_details)
    #events=[{'url': 'https://ra.co/events/1951991', 'name': 'Interzone feat. Zeldris', 'address': '1192 Folsom St, San Francisco, CA 94103'}]
    for event in event_details:
        geocoded = geocode_address(event['address'])
        if geocoded:
            event['geocoded_address'] = geocoded
        else:
            event['geocoded_address'] = None
    print("geocoded results", event_details)
    #this should now push the geocoded results to the database so i am waiting for this to work and once it works i can see the results inside the db
    push_to_database(event_details)

#### geocode address
def geocode_address(address):
    encoded_address = requests.utils.quote(address)
    url = f"{MAPBOX_GEOCODING_URL}{encoded_address}.json?access_token={MAPBOX_ACCESS_TOKEN}"
    response = requests.get(url)
    data = response.json()
    if data['features']:
        # Get the first result (most relevant)
        result = data['features'][0]
        return {
            'longitude': result['center'][0],
            'latitude': result['center'][1],
            'place_name': result['place_name']
        }
    return None


#### get first page
def fetch_start_page(url, proxy_username, proxy_password, proxy_url, retries=3):
    proxies = {
        "http": f"http://{proxy_username}:{proxy_password}@{proxy_url}",
        "https": f"http://{proxy_username}:{proxy_password}@{proxy_url}",
    }
    attempt = 0
    while attempt < retries:
        response = requests.get(url, proxies=proxies, verify=False)
        if response.status_code == 200:
            return response.text
        attempt += 1
        print(f"Attempt {attempt}: Failed to retrieve the page, retrying...")
    return "Failed to retrieve the page after {retries} attempts"


#### get first section
def parse_events(html_content):
    soup = BeautifulSoup(html_content, "html.parser")
    first_section = soup.find("div", class_="Box-sc-abq4qd-0 esoJCv")
    event_links = first_section.find_all(
        "a", href=re.compile(r"https://ra.co/events/\d+")
    )
    unique_links = set()
    for link in event_links:
        if "href" in link.attrs:
            unique_links.add(link["href"])
    return list(unique_links)


#### get all event details
def fetch_with_web_unlocker(url, proxy_username, proxy_password, proxy_url, retries=3):
    proxies = {
        "http": f"http://{proxy_username}:{proxy_password}@{proxy_url}",
        "https": f"http://{proxy_username}:{proxy_password}@{proxy_url}",
    }
    attempt = 0
    while attempt < retries:
        response = requests.get(url, proxies=proxies, verify=False)
        if response.status_code == 200:
            return response.text
        attempt += 1
    return None  # Return None if all retries fail


def fetch_event_details(events, proxy_username, proxy_password, proxy_url):
    proxy_username = os.environ.get("PROXY_USERNAME")
    proxy_password = os.environ.get("PROXY_PASSWORD")
    proxy_url = os.environ.get("PROXY_URL")
    # Loop through each URL, fetch the content, and parse for name and address
    event_details = []
    for url in events:
        html_content = fetch_with_web_unlocker(
            url, proxy_username, proxy_password, proxy_url
        )
        if html_content:
            soup = BeautifulSoup(html_content, "html.parser")
            name = soup.find("h1", class_="Heading__StyledBox-rnlmr6-0").text.strip()
            # Find the address within the specific span element
            address_container = soup.find("li", class_="Column-sc-4kt5ql-0")
            if address_container:
                address_span = address_container.find(
                    "span",
                    class_="Text-sc-wks9sf-0",
                    string=lambda text: "St" in text
                    or "Ave" in text
                    or "Blvd" in text
                    or "Rd" in text,
                )
                address = (
                    address_span.text.strip() if address_span else "Address not found"
                )
            else:
                address = "Address container not found"
            event_details.append({"url": url, "name": name, "address": address})
            print("event details for ", name, "with address ", address, "and url ", url)
        else:
            print(f"Failed to fetch content for {url}.", html_content)
    return event_details

#### push to database
def push_to_database(event_details):
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    data = {"events": event_details}
    response = supabase.table("resident_advisor").insert(data).execute()
    return response


main()
