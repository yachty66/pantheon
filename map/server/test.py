import requests
import json


#i am going to sleep sooni

def get_cheapest_restaurants(api_key, location, radius):
    base_url = "https://places.googleapis.com/v1/places:searchNearby"
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel'
    }
    data = json.dumps({
        "includedTypes": ["restaurant"],
        "maxResultCount": 10,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": float(location.split(',')[0]),
                    "longitude": float(location.split(',')[1])
                },
                "radius": radius
            }
        }
    })

    response = requests.post(base_url, headers=headers, data=data)
    print("response:", response.json())
    results = response.json().get("places", [])
    cheapest_restaurants = []
    for result in results:
        restaurant = {
            "name": result.get("displayName", {}).get("text", ""),
            "address": result.get("formattedAddress", ""),
            "price_level": result.get("priceLevel", "")
        }
        cheapest_restaurants.append(restaurant)
    return cheapest_restaurants

# Example usage
#api_key = 
location = "37.7749,-122.4194"  # San Francisco, CA
radius = 1000  # 1 kilometer

cheapest_restaurants = get_cheapest_restaurants(api_key, location, radius)
for restaurant in cheapest_restaurants:
    print(restaurant)