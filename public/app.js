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
    console.log("Map loaded");

    // Log all layer names to verify the correct layer name
    const layers = map.getStyle().layers;
    layers.forEach(layer => console.log("Layer ID:", layer.id));

    // Define street layers to exclude
    const streetLayers = ["road", "road-label", "bridge", "tunnel"];

    // Add click event listener to all non-street layers
    layers.forEach(layer => {
      if (!streetLayers.includes(layer.id)) {
        map.on("click", layer.id, function (e) {
          const feature = e.features[0];
          const layerId = layer.id;
          console.log("Clicked on layer:", layerId);

          // Display a popup with the feature properties
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h3>${layerId}</h3><p>${JSON.stringify(feature.properties)}</p>`)
            .addTo(map);
        });

        // Change the cursor to a pointer when the mouse is over the layer.
        map.on("mouseenter", layer.id, function () {
          map.getCanvas().style.cursor = "pointer";
        });

        // Change it back to the default cursor when it leaves.
        map.on("mouseleave", layer.id, function () {
          map.getCanvas().style.cursor = "";
        });
      }
    });
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
    new mapboxgl.Marker({ color: "#FF0000" })
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