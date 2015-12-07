var Weather = function(){

	var cityName = "",
		cityCoord = {},
		temp = 0,
		weatherState = "";

	this.getTemp = function() { return temp }
	this.getCityName = function() { return cityName }
	this.getCityCoord = function() { return cityCoord }
	this.getWeatherState = function() { return weatherState }

	//set a new random city
	this.setCity = function(cityID, complete) {

		var self = this; // Preserve context outside AJAX

		//call API and store to fields
		$.getJSON("http://api.openweathermap.org/data/2.5/weather?id=" + cityID + "&APPID=" + keys.weather, function(data){

			// Function calls default to "window" as their context, must specify self.
			updateCityData.call(self, data);
			complete.call(self);
		});
	}

	var updateCityData = function(data) {

		cityName = data.name;

		cityCoord = { lat: parseFloat(data.coord.lat),
					  lng: parseFloat(data.coord.lon) };

		temp = data.main.temp;

		var stateID = data.weather[0].id;
		weatherState = weatherStateList[stateID];

	}
}

var Map = function(mapID) {

	var myOptions = {

		 zoom: 5,
		 center: { lat: 0, lng: 0 },

		 mapTypeId: google.maps.MapTypeId.ROADMAP,
		 disableDefaultUI: true,
	};

	//set the coordinate for the map
	this.setCoord = function(aLatLng) {
		myOptions.center = aLatLng;
		updateMap();
	}

	//set the zoom level for the map
	this.setZoom = function(aZoom) {
		myOptions.zoom = aZoom;
		updateMap();
	}

	var updateMap = function() {
		var map = new google.maps.Map(document.getElementById(mapID), myOptions);

		var marker = new google.maps.Marker({
			position: myOptions.center,
			map: map,
			title: 'Whether?'
		});
	}
}

var UserInterface = function() {

	var temp = 0,
		weatherStates = [],
		weatherStateIndex = 0;

	var SCROLL_TEMP_RATIO = 50,
		SCROLL_DESC_RATIO = 100;

	var DRAG_TEMP_RATIO = 25,
		DRAG_DESC_RATIO = 50;

	var element = {
		sidebar: 	   $("#sidebar"),
		city: 		   $("#sidebar h1"),
		country: 	   $("#sidebar h4"),
		temp: 		   $("#forcast .temp"),
		weatherStates: $("#forcast .weatherStates"),
		icon: 		   $("#forcast .icon")
	}

	var scrollIncrementY = 0,
		scrollIncrementX = 0,
		dragIncrementY = 0,
		dragIncrementX = 0;

	this.setCity = function(c) { element.city.text(c) }
	this.setCountry = function(c) { element.country.text(c) }

	this.setWeatherState = function(a) {
		weatherStates = a;
		// TODO: Create elements for each description
	}

	this.setTemperature = function(t) {
		temp = t;
		element.temp.text(t);
	}

	this.setWeatherStateIndex = function(a) {
		weatherStateIndex = a;
		element.weatherStates.text(weatherStates[weatherStateIndex]);
	}


	var changeTemperature = function(dt) {
		temp += dt;
		element.temp.text(temp)
	}

	// TODO: Slide between DOM elements for each State

	var nextWeatherState = function() {
		if (weatherStateIndex+1 < weatherStates.length) { weatherStateIndex += 1 }
		else { weatherStateIndex = 0 }

		element.weatherStates.text(weatherStates[weatherStateIndex]);
	}

	var lastWeatherState = function() {
		if (weatherStateIndex-1 > 0) { weatherStateIndex -= 1 }
		else { weatherStateIndex = weatherStates.length }

		element.weatherStates.text(weatherStates[weatherStateIndex]);
	}

	var handleIncrements = function(incrementX,
									incrementY,
									ratioX, ratioY) {

		var resetX = false;
		var resetY = false;

		if (Math.abs(incrementY) >= ratioY) {

			var inc = 1;
			var dt = inc * (incrementY / Math.abs(incrementY));

			changeTemperature(dt);

			resetY = true;
		}
		if (Math.abs(incrementX) >= ratioX) {

			if (incrementX > 0) { nextWeatherState() } 
			else { lastWeatherState() }

			resetX = true;
		}

		return [resetX, resetY];
	}

	$(window).on('keydown', function(event) {
		switch(event.keyCode) {
			case 37:
				lastWeatherState();
				break;
			case 38:
				changeTemperature(1)
				break;
			case 39:
				nextWeatherState();
				break;
			case 40:
				changeTemperature(-1)
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

		// Reset SCROLL increments
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

		// Reset DRAG incremenets
		if (resetXY[0]) { dragIncrementX = 0 }
		if (resetXY[1]) { dragIncrementY = 0 }
	});
}

var MakeRoundAction = function(game, userInterface, map, weather) {

	var WEATHER_STATE_OPTIONS = 5;

	var city = "",
		coord = {},
		coordString = "",
		temp = 0,
		weatherStates = [],
		correctStateIndex = 0;
	
	this.FARENHEIT = 0;
	this.CELCIUS = 1;

	this.setTempLocale = function(i) { tempLocale = i }

	this.execute = function(complete) {

		// Preserve context
		var self = this;

		weather.setCity(getRandomCityID(), function() {

			makeStates.call(self);

			updateInterface.call(self);
			updateMap.call(self);

			complete(temp, correctStateIndex);
		});
	}

	var getRandomCityID = function() {

		var cityIDList = storedIDList;
		var cityLength = cityIDList.length;

		var randomCityID = 0;

		var r = Math.random();

		for(var i = 0; i < cityLength; i++){
			if( i / cityLength <= r && r < (i + 1) / cityLength){
				randomCityID = cityIDList[i];
				break;
			}
		}

		return randomCityID;
	}

	var makeStates = function() {

		var tempK = weather.getTemp();
		var cityName = weather.getCityName();
		var coordObj = weather.getCityCoord();
		var weatherState = weather.getWeatherState();

		city = cityName;
		coord = coordObj;
		coordString = coordObj.lat + ", " + coordObj.lng;

		switch(tempLocale) {
			case this.FARENHEIT:
				temp = Math.round(1.8*(tempK - 273.15)+32);
				break;
			case this.CELCIUS:
				temp = Math.round(tempK - 273.15);
				break;
			default:
				temp = Math.round(tempK);
				break;
		}

		var keys = Object.keys(weatherStateList);

		for (var i = 0; i < WEATHER_STATE_OPTIONS-1; i++) {
			var newState = weatherStateList[keys[ keys.length * Math.random() << 0]];
			// TODO: verify that newState isn't weatherStateString or in gameState.weatherStates.
			weatherStates.push(newState);
		}

		var randIndex = Math.floor(Math.random()*WEATHER_STATE_OPTIONS);
		weatherStates.splice(randIndex, 0, weatherState);
		correctStateIndex = randIndex;
	}

	var updateInterface = function() {
		userInterface.setCity(city);
		userInterface.setCountry(coordString);
		userInterface.setWeatherState(weatherStates);
	}

	var updateMap = function() { map.setCoord(coord) }
}

var ScoreRoundAction = function(game, interface) {
	// TODO: Make sure Celcius and Farenheit are scored differently
}

var ScoreGameAction = function(game) {

}

var Game = function() {

	var round = {
		temp: 0,
		stateIndex: 0
	}

	var userInterface = new UserInterface();
	var map = new Map("map");
	var weather = new Weather();

	var makeRound = new MakeRoundAction(this, userInterface, map, weather);

	makeRound.setTempLocale(makeRound.FARENHEIT);

	makeRound.execute(function(correctTemp, correctStateIndex) {
		round.temp = correctTemp;
		round.stateIndex = correctStateIndex;
	});
}

$(document).ready(function() {
	var whether = new Game();
});