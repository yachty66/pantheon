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
    // Add a layer for place labels
    map.addLayer({
      id: 'place-labels',
      type: 'symbol',
      source: {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8'
      },
      'source-layer': 'place_label',
      layout: {
        'text-field': ['get', 'name'],

      },
    });

    // Add click event listener to the place labels layer
    map.on("click", "place-labels", function (e) {
      const feature = e.features[0];
      const placeName = feature.properties.name;

      // Check for specific neighborhood names
      if (placeName === "Hayes Valley" || placeName === "Another Neighborhood") {
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<h3>${placeName}</h3>
             <img src="https://upload.wikimedia.org/wikipedia/commons/9/9d/US_Navy_090620-N-2798F-033_Sailors_assigned_to_the_aircraft_carrier_USS_Harry_S._Truman_%28CVN_75%29_and_Carrier_Air_Wing_%28CVW%29_3_compete_in_a_Texas_Hold_%27Em_Poker_tournament_aboard_Harry_S._Truman.jpg" alt="${placeName}" style="width:100%;"/>`
          )
          .addTo(map);
      }
    });

    // Change the cursor to a pointer when the mouse is over the place labels layer.
    map.on('mouseenter', 'place-labels', function () {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to the default cursor when it leaves.
    map.on('mouseleave', 'place-labels', function () {
      map.getCanvas().style.cursor = '';
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
