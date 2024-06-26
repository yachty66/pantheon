mapboxgl.accessToken = "pk.eyJ1IjoieWFjaHR5NjYiLCJhIjoiY2x4aTZndXJuMW8xdzJpcHJyYTFiMnl1cSJ9.BQezezawWYgnD6sBZMsvnw";

function initializeMap() {
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-122.4194, 37.7749], // Centered on San Francisco
        zoom: 12
    });

    // Call loadEvents when the map loads
    map.on('load', function() {
        loadEvents();
    });
}

/*


{
    "data": [
        {
            "id": 12,
            "created_at": "2024-06-20T22:35:04.914704+00:00",
            "events": "[{\"url\": \"https://ra.co/events/1938976\", \"name\": \"Shelter SF DNB - DJ Sep - Hydrolyphics - Duchess\", \"address\": \"424 Haight St, San Francisco, CA 94117, United States\"}, {\"url\": \"https://ra.co/events/1945923\", \"name\": \"ADULT SERVICES - Greg Eversoul - Jaage - Art by Kayla Johnson and More\", \"address\": \"101 6th Street, San Francisco, CA 94103, United States\"}, {\"url\": \"https://ra.co/events/1942298\", \"name\": \"Pixie Pop and F8 Presents Holoflux\", \"address\": \"1192 Folsom St, San Francisco, CA 94103\"}, {\"url\": \"https://ra.co/events/1943175\", \"name\": \"Inner Circle feat. Rieta + 5lowers\", \"address\": \"3138 Fillmore St, San Francisco, CA 94123, United States\"}, {\"url\": \"https://ra.co/events/1945897\", \"name\": \"Shelter Drum & Bass\", \"address\": \"424 Haight St, San Francisco, CA 94117, United States\"}, {\"url\": \"https://ra.co/events/1911279\", \"name\": \"JENGI\", \"address\": \"1015 Folsom Street; San Francisco, CA 94103; United States\"}, {\"url\": \"https://ra.co/events/1940967\", \"name\": \"Causmic Creative feat. Beat Kitty\", \"address\": \"1192 Folsom St, San Francisco, CA 94103\"}, {\"url\": \"https://ra.co/events/1934140\", \"name\": \"Thursdays at District\", \"address\": \"827 Washington St, Oakland, CA 94607\"}, {\"url\": \"https://ra.co/events/1947581\", \"name\": \"Stilldream 2024\", \"address\": \"Belden Town, Belden, CA 95915, United States\"}]"
        }
    ]
}
*/

function loadEvents() {
    fetch('http://127.0.0.1:8000/events')
        .then(response => response.json())
        .then(data => {
            console.log('Events:', data); // Log the events data
        })
        .catch(error => console.error('Error fetching events:', error));
}

// Call initializeMap when the window loads
window.onload = initializeMap;