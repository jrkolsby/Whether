var WeatherAPI = function(){
	//import and store IDList to avoid manipulation

	this.CELCIUS = 0;
	this.FARENHEIT = 1;

	var STATE_OPTIONS = 3;

	var cityIDList = storedIDList;
	var cityLength = cityIDList.length;
	
	var randNum = 0;
	var randCityID = 0;

	var cityName;
	var cityCoord = {lat: 0, lng: 0};
	var tempK;
	var weatherState;
	var weatherStateString;

	var gameState = {
		city: "",
		coord: "",
		temp: 0,
		weatherStates: [],
		correctStateIndex: 0
	};

	var tempLocale = this.FARENHEIT;

	var updateCityData = function(data) {
		cityName = data.name;
		cityCoord = {lat: parseFloat(data.coord.lat), lng: parseFloat(data.coord.lon)};

		tempK = data.main.temp;

		weatherState = data.weather[0].id;
		weatherStateString = weatherStateList[weatherState];
	}

	var generateGameState = function() {

		gameState.city = cityName;
		gameState.coord = cityCoord.lat + ", " + cityCoord.lng;

		switch(tempLocale) {
			case this.FARENHEIT:
				gameState.temp = Math.round(1.8*(tempK - 273.15)+32);
				break;
			case this.CELCIUS:
				gameState.temp = Math.round(tempK - 273.15);
				break;
			default:
				gameState.temp = Math.round(tempK);
				break;
		}

		var keys = Object.keys(weatherStateList);

		for (var i = 0; i < STATE_OPTIONS-1; i++) {
			var newState = weatherStateList[keys[ keys.length * Math.random() << 0]];
			gameState.weatherStates.push(newState);
		}

		var randIndex = Math.floor(Math.random()*STATE_OPTIONS);
		gameState.weatherStates.splice(randIndex, 0, weatherState);
		gameState.correctStateIndex = randIndex;

		console.log(gameState.weatherStates);
	}

	//set a new random city
	this.setCity = function(complete){
		//generate random number, generate random city ID
		randNum = Math.random();
		for(var i = 0; i < cityLength; i++){
			if( i / cityLength <= randNum && randNum < (i + 1) / cityLength){
				randCityID = cityIDList[i];
				break;
			}
		}

		// Must preserve context outside API call
		var self = this;

		//call API and store to fields
		$.getJSON("http://api.openweathermap.org/data/2.5/weather?id=" + randCityID + "&APPID=" + keys.weather, function(data){

			// Function calls default to "window" as their context, must specify self.
			updateCityData.call(self, data);
			generateGameState.call(self);
			complete.call(self);
		});
	}
	this.getGameState = function() { return gameState }
	this.setTempLocale = function(i) { tempLocale = i }
}

var Map = function(mapID) {
	//options for google maps API V3
	var LatLng = {lat: 0, lng: 0};

	var myOptions = {
		 zoom: 5,
		 center: {lat: 0, lng: 0},
		 mapTypeId: google.maps.MapTypeId.ROADMAP,
		 disableDefaultUI: true,
	};

	var map = new google.maps.Map(document.getElementById(mapID), myOptions);
	var marker = new google.maps.Marker({
		position: LatLng,
		map: map,
		title: 'Whether?'
	});

	//set the coordinate for the map
	this.setCoord = function( aLatLng){
		myOptions.center = aLatLng;
		LatLng = aLatLng;
	}

	//set the zoom level for the map
	this.setZoom = function(aZoom){
		myOptions.zoom = aZoom;
	}
}

var UserInterface = function(vertical, horizontal) {

	var SCROLL_TEMP_RATIO = 50,
		SCROLL_DESC_RATIO = 100;

	var DRAG_TEMP_RATIO = 25,
		DRAG_DESC_RATIO = 50;

	this.DIRECTION_LEFT = 0;
	this.DIRECTION_RIGHT = 1;

	var element = {
		sidebar: $("#sidebar"),
		city: $("#sidebar h1"),
		country: $("#sidebar h4"),
		temp: $("#forcast .temp"),
		desc: $("#forcast .desc"),
		icon: $("#forcast .icon")
	}

	var	scrollIncrementY = 0,
		scrollIncrementX = 0,
		dragIncrementY = 0,
		dragIncrementX = 0;

	this.setCity = function(c) { element.city.text(c) }
	this.setCountry = function(c) { element.country.text(c) }
	this.setTemperature = function(t) { element.temp.text(t) }
	this.setDescription = function(d, dir) {
		element.desc.text(d);
	}

	var handleIncrements = function(incrementX,
									incrementY,
									ratioX, ratioY) {

		var resetX = false;
		var resetY = false;

		if (Math.abs(incrementY) >= ratioY) {

			var inc = 1;
			var dt = inc * (incrementY / Math.abs(incrementY));

			vertical(dt);

			resetY = true;
		}
		if (Math.abs(incrementX) >= ratioX) {

			if (incrementX > 0) { horizontal(1) } 
			else { horizontal(-1) }

			resetX = true;
		}

		return [resetX, resetY];
	}

	$(window).on('keydown', function(event) {
		switch(event.keyCode) {
			case 37:
				horizontal(-1);
				break;
			case 38:
				vertical(1);
				break;
			case 39:
				horizontal(1);
				break;
			case 40:
				vertical(-1);
		}
	}).on('mousewheel', function(event) {

		scrollIncrementX -= event.deltaX;
		scrollIncrementY -= event.deltaY;

		var resetXY =
		handleIncrements.call(this, 
						      scrollIncrementX,
						 	  scrollIncrementY,
						 	  SCROLL_DESC_RATIO,
						 	  SCROLL_TEMP_RATIO);

		if (resetXY[0]) { scrollIncrementX = 0 }
		if (resetXY[1]) { scrollIncrementY = 0 }
	});

	element.sidebar.bind('move', function(event) {

		dragIncrementX += event.deltaX;
		dragIncrementY -= event.deltaY;

		var resetXY =
		handleIncrements.call(this, 
						      dragIncrementX,
						 	  dragIncrementY,
						 	  DRAG_DESC_RATIO,
						 	  DRAG_TEMP_RATIO);

		if (resetXY[0]) { dragIncrementX = 0 }
		if (resetXY[1]) { dragIncrementY = 0 }
	});
}

var Game = function() {
	var state = {
		city: "Lorem Ipsum Dolor",
		country: "Sit Amet",
		temp: 0,
		correctTemp: 0,
		desc: [],
		descID: 0,
		correctDescID: 0
	}

	// Constrcut new user interface with callbacks for inherit events
	var	userInterface = new UserInterface(function(d) {
		changeTemperature(d);
	}, function(d) {
		if (d > 0) { nextDesc() }
		else { lastDesc() }
	});

	var updateUserInterfaceWithState = function() {
		userInterface.setCity(state.city);
		userInterface.setCountry(state.country);
		userInterface.setTemperature(state.temp);
		userInterface.setDescription(state.desc[state.descID]);
		console.log(state);
	}

	var changeTemperature = function(dt) { 
		state.temp += dt;
		userInterface.setTemperature(state.temp);
	}

	var updateDesc = function(dir) {
		if (state.descID >= state.desc.length) { state.descID = 0 }
		else if (state.descID < 0) { state.descID = state.desc.length-1 }

		var newDesc = state.desc[state.descID]
		userInterface.setDescription(newDesc, dir);
	}

	var nextDesc = function() {
		state.descID += 1;
		updateDesc.call(this, userInterface.DIRECTION_RIGHT);
	}
	var lastDesc = function() {
		state.descID -= 1;
		updateDesc.call(this, userInterface.DIRECTION_LEFT);
	}

	var map = new Map("map");

	var weather = new WeatherAPI();
	weather.setTempLocale(weather.FARENHEIT);

	weather.setCity(function() {
		var weatherState = weather.getGameState()

		state.city = weatherState.city;
		state.country = weatherState.coord;
		state.desc = weatherState.weatherStates;
		state.correctDescID = weatherState.correctStateIndex;

		updateUserInterfaceWithState.call(this);
	});
}

$(document).ready(function() {
	var whether = new Game();
});