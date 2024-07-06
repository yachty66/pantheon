import requests

access_token = 'pk.eyJ1IjoieWFjaHR5NjYiLCJhIjoiY2x4aTZndXJuMW8xdzJpcHJyYTFiMnl1cSJ9.BQezezawWYgnD6sBZMsvnw'
address = '1600 Pennsylvania Ave NW, Washington, DC 20500'  # Example address

# Forward geocoding to get the location of the specified address
geocode_url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json?access_token={access_token}"
response = requests.get(geocode_url)
data = response.json()

# Print the full response object
print(data)