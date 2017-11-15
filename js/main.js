// Using Leaflet for creating the map and adding controls for interacting with the map
// Created by Katarzyna Kowalik
// Salzburg, 29/11/2016

//
//--- Part 1: adding base maps ---
//

//creating the map; defining the location in the center of the map (geographic coords) and the zoom level. These are properties of the leaflet map object
//the map window has been given the id 'map' in the .html file
var map = L.map('map', {
	center: [47.580, 13.016],
	zoom: 14,
	zoomControl: false
});


//adding attribution for map
map.attributionControl.addAttribution("&copy Katarzyna Kowalik 2016");
map.attributionControl.addAttribution("Routes data from <a href=\"https://www.alpenvereinaktiv.com/de/\">alpenverainaktiv.com</a>");


//adding a base maps 
var landscape = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=da0654cb94c64e4588b744d40b02b2dd', {
	attribution: 'Tiles from Thunderforest'}).addTo(map);


//
//---- Part 2: Adding controls: scale bar & zoom control
//

//zoomHome plugin - controls default view button (cc: https://github.com/torfsen/leaflet.zoomhome)
var zoomHome = L.Control.zoomHome();
zoomHome.addTo(map);

//scale
L.control.scale().addTo(map);


//
//---- Part 3: Adding points of interests (point features) ---- 
//


//marker constructors - each with different properties
var MyIcon = L.Icon.extend({
	options:{
		iconSize: [36, 36],
		iconAnchor: [18, 18],
		popupAnchor: [100, 0]
	}
});

var bigIcon = L.Icon.extend({
	options:{
		iconSize: [64, 64],
		iconAnchor: [32, 32],
		popupAnchor: [164, 248]
	}
});

var normalIcon = L.Icon.extend({
	options:{
		iconSize: [64, 64],
		iconAnchor: [32, 32],
		popupAnchor: [0, -32]
	}
});
	
	
//points that aren't viewpoints - have slightly different popup and icons:
//converting them from GeoJson to layer
var points = L.geoJson(interest, {
	
	filter: function(feature, layer) {
		return feature.properties.Type != "panoramic view";
    },
	
	onEachFeature: function (feature, layer){
		if (feature.properties.Type == "start"){
			layer.bindPopup(
			'<div class = "point_pop">Start: <span class = "newbold">Jennerbahn Station</span></div>'
			, {maxWidth: 220}
			);
		} else {if (feature.properties.Type == "house"){
			layer.bindPopup(
			'<div class = "point_pop">Finish:  <span class = "newbold">Schneibstein House</span></div>'
			, {maxWidth: 220}
			);
		} else {if (feature.properties.Type == "parking"){
			layer.bindPopup(
			'<div class = "point_pop">Parking: <span class = "newbold">Königssee</span></div>',
			{maxWidth: 220}
			);
		}}}
	},
	
	pointToLayer: function(feature, latlng){
		return L.marker(latlng, {icon: new MyIcon ({iconUrl: feature.properties.URL})})
		.on('mouseover', function(){
		this.setIcon(new normalIcon ({iconUrl: feature.properties.URL}) )
		})
		.on('mouseout', function(){
		this.setIcon(new MyIcon ({iconUrl: feature.properties.URL}) )
		});
	}
});	


//viewpoints that have all the same structure:
//converting them from GeoJson to layer
var viewpoints = L.geoJson(interest, {
	
	filter: function(feature, layer) {
		return feature.properties.Type == "panoramic view";
    },
	
	onEachFeature: function (feature, layer){
		layer.bindPopup(
		'<div class = "point_pop">Viewpoint: <span class = "newbold">'+feature.properties.Note+'</span><img src = "'+
		feature.properties.Pic+'"></div>', {maxWidth: 220, className: "custom"}
		);
	},
	
	pointToLayer: function(feature, latlng){
		return L.marker(latlng, {icon: new MyIcon ({iconUrl: feature.properties.URL})})
		.on('mouseover', function(){
		this
		.setIcon(new bigIcon ({iconUrl: feature.properties.URL}) )
		})
		.on('mouseout', function(){
		this.setIcon(new MyIcon ({iconUrl: feature.properties.URL}) )
		});
	}
});


//adding both sets of points to the map
points.addTo(map);
viewpoints.addTo(map);


//adding a GeoJSON polygon feature sets
var longStyle = {
    "color": "#ff7800",
    "weight": 3,
    "opacity": 0.8,
}

var quickStyle = {
    "color": "#8000ff",
    "weight": 3,
    "opacity": 0.8
}

//
//---- Part 4: adding line features from the geojson file 
//

//defining highlighting/reseting functions for routes
  
function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 5,
			opacity: 1
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
}


function reset_lw(e) {
		long_way.resetStyle(e.target);
		info.update();
}

function reset_qw(e) {
		quick_way.resetStyle(e.target);
		info.update();
}
   

//adding features from GeoJSON to layer
var long_way= L.geoJson(longway, {
    style: longStyle,
	onEachFeature: function (feature, layer){
		layer.on({
			mouseover: highlightFeature,
			mouseout: reset_lw,
		});
	}
	
});

var quick_way= L.geoJson(quickway, {
    style: quickStyle,
	onEachFeature: function (feature, layer){
		layer.on({
			mouseover: highlightFeature,
			mouseout: reset_qw,
		});
	}
});


//adding layer to map
long_way.addTo(map);
quick_way.addTo(map);


//
//---- Part 4: adding additional controls and legend
//

// control that shows route info on hover
	var info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (path_no) {
		this._div.innerHTML = (path_no ? '<div class = "container"><span class="newbold">' + path_no.Name + '</span><br>' + 	
	'<img src="'+ path_no.URL +'"><br>Distance:<b> ' +
	path_no.Dis + '</b> | Duration:<b> ' + path_no.Dur + '</b> | Difficulty:<b> ' + path_no.Dif + '</b></div>': 
	'<div class = "container"><span class="newbold">How to reach the Schneibstein House?</span><br><br><i>Hover over the route to get the details</i></div>');
	};

	info.addTo(map);


// adding small legend with the routes

var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Routes:</strong>'],
    categories = ['Quick way','Long way'],
	linecolors = ['#8000ff','#ff7800'];

    for (var i = 0; i < categories.length; i++) {

        labels.push(
        '<i class="circle" style="background:' + linecolors[i] + '"></i> ' + categories[i]);

        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(map);





