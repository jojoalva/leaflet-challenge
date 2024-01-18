// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

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

// Create layer groups for earthquakes and tectonic plates.
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

// Create an overlay object to hold our overlays.
let overlayMaps = {
  Earthquakes: earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Create our map, giving it the street map and earthquakes layers to display on load.
let myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [street, earthquakes]
});

// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Fetch earthquake data from the provided API endpoint.
d3.json(queryUrl).then(function(data){

    // Function to add style to each earthquake feature.
    function addStyle(feature){
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
                        return "burgundy";
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
    function addRadius(magnitude){
        return magnitude * 8;
    
    }

    

    // Create a GeoJSON layer with circle markers for each earthquake feature.
    L.geoJson(data, {
        pointToLayer: function (feature, latlng){return L.circleMarker(latlng)},
        style: addStyle,
        onEachFeature: function (feature, layer) {
            // Add a popup with information about each earthquake.
            layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}<br>
            Location: ${feature.properties.place}`);
          }

    }).addTo(earthquakes);

    // Add the earthquakes layer to the map.
    earthquakes.addTo(myMap);
    tectonicPlates.addTo(myMap);

    // Add the legend with colors to corrolate with depth
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
    depth = [-10, 10, 30, 50, 70, 90];

    for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
        '<i style="background:' + addColour(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
    };

legend.addTo(myMap)

});