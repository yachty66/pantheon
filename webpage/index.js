let map;

async function loadGoogleMapsApi() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  return new Promise((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps API"));
  });
}

async function initMap() {
  await loadGoogleMapsApi();
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  map = new google.maps.Map(document.getElementById("map"), {
    center: new google.maps.LatLng(37.77402492464839, -122.42950970592005),
    zoom: 16,
    mapId: "DEMO_MAP_ID",
  });

  const response = await fetch("merged_company_data.json");
  const mergedData = await response.json();

  const features = mergedData.map((entry) => ({
    position: new google.maps.LatLng(entry.latitude, entry.longitude),
    image: entry.profile_picture_url,
    title: entry.name,
    metadata: entry,
  }));

  features.forEach((feature) => addMarker(feature));
}

function addMarker(feature) {
  const iconImage = document.createElement("img");
  iconImage.src = feature.image;
  iconImage.style.width = "32px";
  iconImage.style.height = "32px";

  const marker = new google.maps.marker.AdvancedMarkerElement({
    map,
    position: feature.position,
    content: iconImage,
  });

  marker.addListener("click", () => {
    const metadata = feature.metadata;
    let infoContent = `<div><strong>${feature.title}</strong><br>`;

    for (const key in metadata) {
      if (
        metadata.hasOwnProperty(key) &&
        key !== "latitude" &&
        key !== "longitude" &&
        key !== "profile_picture_url" &&
        key !== "tags"
      ) {
        if (key === "socials") {
          infoContent += `<strong>${key}:</strong><br>`;
          for (const socialKey in metadata[key]) {
            const socialUrl = metadata[key][socialKey];
            if (socialUrl !== "Not available") {
              infoContent += `<a href="${socialUrl}" target="_blank">${socialKey}</a> `;
            }
          }
          infoContent += `<br>`;
        } else if (key === "founders") {
          infoContent += `<strong>${key}:</strong><br>`;
          metadata[key].forEach((founder) => {
            infoContent += `name: ${founder.name} `;
            if (founder.socials) {
              for (const socialKey in founder.socials) {
                const socialUrl = founder.socials[socialKey];
                if (socialUrl !== "Not available") {
                  infoContent += `<a href="${socialUrl}" target="_blank">${socialKey}</a> `;
                }
              }
            }
            infoContent += `<br>`;
          });
        } else if (
          typeof metadata[key] === "object" &&
          metadata[key] !== null
        ) {
          infoContent += `<strong>${key}:</strong><br>`;
          for (const subKey in metadata[key]) {
            const subValue = metadata[key][subKey];
            infoContent += `${subKey}: ${
              subValue !== "Not available" && subValue.startsWith("http")
                ? `<a href="${subValue}" target="_blank">${subValue}</a>`
                : subValue
            }<br>`;
          }
        } else {
          const value = metadata[key];
          infoContent += `<strong>${key}:</strong> ${
            value !== "Not available" && value.startsWith("http")
              ? `<a href="${value}" target="_blank">${value}</a>`
              : value
          }<br>`;
        }
      }
    }

    const infoWindow = new google.maps.InfoWindow({
      content: infoContent,
    });
    infoWindow.open({
      anchor: marker,
      map,
      shouldFocus: false,
    });
  });
}

initMap();
