
mapboxgl.accessToken = mapToken; //--> the mapToken variable was declared on the show template this code will be on the browser side so i do not have access to process.env
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-streets-v11', // style URL
    center: foundCamp.geometry.coordinates, // starting position [lng, lat]
    zoom: 4, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});

map.addControl(new mapboxgl.NavigationControl());

map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
});

// adds a marker
const marker = new mapboxgl.Marker()
    .setLngLat(foundCamp.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${foundCamp.title}</h3><p>${foundCamp.location}</p>`
            )
    )
    .addTo(map);s