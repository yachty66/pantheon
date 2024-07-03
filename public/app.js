let map; // Declare map as a global variable

function initializeMap() {
  mapboxgl.accessToken =
    "pk.eyJ1IjoieWFjaHR5NjYiLCJhIjoiY2x4aTZndXJuMW8xdzJpcHJyYTFiMnl1cSJ9.BQezezawWYgnD6sBZMsvnw";
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-122.4194, 37.7749], // Centered on San Francisco
    zoom: 12,
  });

  map.on("load", function () {
    loadEvents();
  });
}

function loadEvents() {
  fetch("/api/events")
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error("Error:", data.error);
        return;
      }
      console.log("Latest Events:", data.data);
      const events = JSON.parse(data.data.events);
      displayEvents(events);
    })
    .catch((error) => console.error("Error fetching events:", error));
}

function displayEvents(events) {
  events.forEach((event) => {
    const { longitude, latitude } = event.geocoded_address;

    // Create a red marker for each event
    new mapboxgl.Marker({ color: "#FF0000" }) // Set color to red
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
window.onload = function () {
  initializeMap();
};
