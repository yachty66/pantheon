mapboxgl.accessToken = "pk.eyJ1IjoieWFjaHR5NjYiLCJhIjoiY2x4aTZndXJuMW8xdzJpcHJyYTFiMnl1cSJ9.BQezezawWYgnD6sBZMsvnw";
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-122.4194, 37.7749], // Centered on San Francisco
    zoom: 12
});

function loadEvents() {
    fetch('http://127.0.0.1:8000/events')
        .then(response => response.json())
        .then(data => {
            const events = JSON.parse(data.data[0].events); // Assuming the events are in the first item of data array
            events.forEach(event => {
                // Extract latitude and longitude from address using a geocoding service if not directly available
                // For now, let's assume you have latitude and longitude directly available or add them manually

                // Create a marker for each event
                const marker = new mapboxgl.Marker({ color: 'red' })
                    .setLngLat([event.longitude, event.latitude]) // You need to have longitude and latitude in your event data
                    .addTo(map);

                // Create a popup for each marker
                const popup = new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<h3>${event.name}</h3><p>${event.address}</p><a href="${event.url}" target="_blank">Navigate</a>`);

                // Attach the popup to the marker
                marker.setPopup(popup);
            });
        })
        .catch(error => console.error('Error fetching events:', error));
}

// Call loadEvents when the map loads
map.on('load', loadEvents);