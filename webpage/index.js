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

  const iconBase = "https://developers.google.com/maps/documentation/javascript/examples/full/images/";
  const icons = {
    parking: {
      icon: iconBase + "parking_lot_maps.png",
    },
    library: {
      icon: iconBase + "library_maps.png",
    },
    info: {
      icon: iconBase + "info-i_maps.png",
    },
  };

  const awsImageUrl = "https://bookface-images.s3.amazonaws.com/small_logos/9509c7e59d312ec1fba7486bc3b4896f2d02edec.png";

  const features = [
    { position: new google.maps.LatLng(-33.91721, 151.2263), type: "info", image: awsImageUrl, title: "Company A" },
    { position: new google.maps.LatLng(-33.91539, 151.2282), type: "info", image: awsImageUrl, title: "Company B" },
    { position: new google.maps.LatLng(-33.91747, 151.22912), type: "info", image: awsImageUrl, title: "Company C" },
    { position: new google.maps.LatLng(-33.9191, 151.22907), type: "info", image: awsImageUrl, title: "Company D" },
    { position: new google.maps.LatLng(-33.91725, 151.23011), type: "info", image: awsImageUrl, title: "Company E" },
    { position: new google.maps.LatLng(-33.91872, 151.23089), type: "info", image: awsImageUrl, title: "Company F" },
    { position: new google.maps.LatLng(-33.91784, 151.23094), type: "info", image: awsImageUrl, title: "Company G" },
    { position: new google.maps.LatLng(-33.91682, 151.23149), type: "info", image: awsImageUrl, title: "Company H" },
    { position: new google.maps.LatLng(-33.9179, 151.23463), type: "info", image: awsImageUrl, title: "Company I" },
    { position: new google.maps.LatLng(-33.91666, 151.23468), type: "info", image: awsImageUrl, title: "Company J" },
    { position: new google.maps.LatLng(-33.916988, 151.23364), type: "info", image: awsImageUrl, title: "Company K" },
    { position: new google.maps.LatLng(-33.91662347903106, 151.22879464019775), type: "parking", image: awsImageUrl, title: "Company L" },
    { position: new google.maps.LatLng(-33.916365282092855, 151.22937399734496), type: "parking", image: awsImageUrl, title: "Company M" },
    { position: new google.maps.LatLng(-33.91665018901448, 151.2282474695587), type: "parking", image: awsImageUrl, title: "Company N" },
    { position: new google.maps.LatLng(-33.919543720969806, 151.23112279762267), type: "parking", image: awsImageUrl, title: "Company O" },
    { position: new google.maps.LatLng(-33.91608037421864, 151.23288232673644), type: "parking", image: awsImageUrl, title: "Company P" },
    { position: new google.maps.LatLng(-33.91851096391805, 151.2344058214569), type: "parking", image: awsImageUrl, title: "Company Q" },
    { position: new google.maps.LatLng(-33.91818154739766, 151.2346203981781), type: "parking", image: awsImageUrl, title: "Company R" },
    { position: new google.maps.LatLng(-33.91727341958453, 151.23348314155578), type: "library", image: awsImageUrl, title: "Company S" },
    { 
      position: new google.maps.LatLng(-33.91872, 151.23089), 
      type: "custom", 
      image: awsImageUrl,
      title: "Company T"
    },
  ];

  features.forEach(feature => addMarker(feature));
}

function addMarker(feature) {
  const iconImage = document.createElement("img");
  if (feature.image) {
    iconImage.src = feature.image;
    iconImage.style.width = '32px';  // Set the width to an appropriate size
    iconImage.style.height = '32px'; // Set the height to an appropriate size
  } else {
    iconImage.src = icons[feature.type].icon;
  }

  const marker = new google.maps.marker.AdvancedMarkerElement({
    map,
    position: feature.position,
    content: iconImage,
  });

  // Add a click listener to the marker
  marker.addListener("click", () => {
    const infoWindow = new google.maps.InfoWindow({
      content: `<div><strong>${feature.title}</strong></div>`
    });
    infoWindow.open({
      anchor: marker,
      map,
      shouldFocus: false,
    });
  });
}

initMap();
