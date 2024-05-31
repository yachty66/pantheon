let map;

async function initMap() {
    // Request needed libraries.
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new google.maps.Map(document.getElementById("map"), {
        center: new google.maps.LatLng(-33.91722, 151.23064),
        zoom: 16,
        mapId: "DEMO_MAP_ID",
    });

    // Fetch the JSON data
    const response = await fetch('merged_company_data.json');
    const mergedData = await response.json();

    // Create features from the JSON data
    const features = mergedData.map(entry => ({
        position: new google.maps.LatLng(entry.latitude, entry.longitude),
        image: entry.profile_picture_url,
        title: entry.name,
        metadata: entry
    }));

    features.forEach(feature => addMarker(feature));
}

function addMarker(feature) {
    const iconImage = document.createElement("img");
    iconImage.src = feature.image;
    iconImage.style.width = '32px';  // Set the width to an appropriate size
    iconImage.style.height = '32px'; // Set the height to an appropriate size

    const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: feature.position,
        content: iconImage,
    });

    // Add a click listener to the marker
    marker.addListener("click", () => {
        const infoContent = `<div>
            <strong>${feature.title}</strong><br>
            Address: ${feature.metadata.address}<br>
            Founded: ${feature.metadata.founded || 'N/A'}<br>
            Team Size: ${feature.metadata.team_size || 'N/A'}<br>
            Description: ${feature.metadata.description || 'N/A'}<br>
            <a href="${feature.metadata.url}" target="_blank">Company Link</a>
        </div>`;
        const infoWindow = new google.maps.InfoWindow({
            content: infoContent
        });
        infoWindow.open({
            anchor: marker,
            map,
            shouldFocus: false,
        });
    });
}

initMap();