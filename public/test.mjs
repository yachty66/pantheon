import fetch from "node-fetch"; // Use import instead of require
const mapboxToken =
  "pk.eyJ1IjoieWFjaHR5NjYiLCJhIjoiY2x4aTZndXJuMW8xdzJpcHJyYTFiMnl1cSJ9.BQezezawWYgnD6sBZMsvnw";

async function fetchLocations() {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/landmark.json?proximity=-122.4194,37.7749&limit=50&types=poi&access_token=${mapboxToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.features.map((feature) => ({
      name: feature.text,
      description: feature.place_name,
      coordinates: feature.geometry.coordinates,
    }));
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

// Test the function
fetchLocations().then((locations) => {
  console.log("Fetched Locations:", locations);
});



