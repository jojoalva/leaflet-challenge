// Store our API endpoint as queryUrl - last 7 days of data.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

// Create the base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a baseMaps object.
let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
};

// Create layer groups for earthquakes.
let earthquakes = new L.LayerGroup();

// Create an overlay object to hold our overlays.
let overlayMaps = {
    Earthquakes: earthquakes
};

// Create our map, giving it the street map and earthquakes layers to display on load.
let myMap = L.map("map", {
    center: [0, -20],
    zoom: 3,
    layers: [street, earthquakes]
});

// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

// Fetch earthquake data from the provided API endpoint.
d3.json(queryUrl).then(function (data) {

    // Function to add style to each earthquake feature.
    function addStyle(feature) {
        return {
            fillColor: addColour(feature.geometry.coordinates[2]),
            radius: addRadius(feature.properties.mag),
            opacity: 1,
            fillOpacity: 0.7,
            stroke: true,
            weight: 0.5
        };
    }

    // Function to determine the fill color based on depth.
    function addColour(depth) {
        switch (true) {
            case depth > 90:
                return "#9b0404";
            case depth > 70:
                return "red";
            case depth > 50:
                return "orangered";
            case depth > 30:
                return "orange";
            case depth > 10:
                return "yellow";
            default:
                return "lightgreen";
        }
    }

    // Function to determine the radius of the circle marker based on magnitude.
    function addRadius(magnitude) {
        return magnitude * 3;

    }



    // Create a GeoJSON layer with circle markers for each earthquake feature.
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) { return L.circleMarker(latlng) },
        style: addStyle,
        onEachFeature: function (feature, layer) {
            // Add a popup with information about each earthquake.
            let depth = feature.geometry.coordinates[2];
            let place = feature.properties.place;
            let mag = feature.properties.mag;
            let time = new Date(feature.properties.time).toLocaleString();

            layer.bindPopup(`
            <h4>
                ${place}<br>
                Magnitude: ${mag}<br>
                Depth: ${depth}<br>
                ${time}
            </h4>`);
        }

    }).addTo(earthquakes);

    // Add the earthquakes layer to the map.
    earthquakes.addTo(myMap);


    // Add the legend with colours to correlate with depth
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
            depth = [-10, 10, 30, 50, 70, 90];

        div.style.padding = '5px';
        div.style.borderRadius = '8px';
        div.style.background = 'white';
        div.innerHTML = '<h4 style="margin:0;text-align:center">Depth</h4>';
        div.style.border = '2px solid black';

        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="display:inline-block;padding:6px;background:' + addColour(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(myMap)

});