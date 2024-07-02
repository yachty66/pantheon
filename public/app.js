let map; // Declare map as a global variable

function initializeMap() {
    mapboxgl.accessToken = "pk.eyJ1IjoieWFjaHR5NjYiLCJhIjoiY2x4aTZndXJuMW8xdzJpcHJyYTFiMnl1cSJ9.BQezezawWYgnD6sBZMsvnw";;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-122.4194, 37.7749], // Centered on San Francisco
        zoom: 12
    });

    map.on('load', function() {
        loadEvents();
    });
}

function initializeWebSocket() {
    const socket = new WebSocket("ws://localhost:8000/ws");

    socket.onopen = function(event) {
        console.log("WebSocket is open now.");
    };

    socket.onmessage = function(event) {
        console.log("WebSocket message received:", event.data);
        test(event.data); // Call the test function with the received message
    };

    socket.onclose = function(event) {
        console.log("WebSocket is closed now.");
    };

    socket.onerror = function(error) {
        console.error("WebSocket error observed:", error);
    };
}

async function go_to_place(placeName = 'Berlin') {
    //all what needs to happen is that this endpoint is getting called 
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(placeName)}.json?access_token=${mapboxgl.accessToken}`;

    try {
        const response = await fetch(geocodingUrl);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const coordinates = data.features[0].center;
            
            map.flyTo({
                center: coordinates,
                zoom: 10, // Adjust this value to set the desired zoom level
                essential: true // This animation is considered essential with respect to prefers-reduced-motion
            });
        } else {
            console.error('Location not found');
        }
    } catch (error) {
        console.error('Error fetching location:', error);
    }
}

    

function loadEvents() {
    fetch('/api/events')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }
            console.log('Latest Events:', data.data);
            const events = JSON.parse(data.data.events);
            displayEvents(events);
        })
        .catch(error => console.error('Error fetching events:', error));
}

function displayEvents(events) {
    events.forEach(event => {
        const { longitude, latitude } = event.geocoded_address;
        
        // Create a red marker for each event
        new mapboxgl.Marker({ color: '#FF0000' }) // Set color to red
            .setLngLat([longitude, latitude])
            .setPopup(
                new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML(
                        `<h3>${event.name}</h3><p>${event.address}</p><a href="${event.url}" target="_blank">Event Details</a>`
                    )
            )
            .addTo(map);
    });
}

// Call initializeMap when the window loads
window.onload = function() {
    initializeMap();
    initializeWebSocket();
};