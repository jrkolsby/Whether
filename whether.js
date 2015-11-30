var WeatherAPI = function(){
	//import and store IDList to avoid manipulation
	var cityIDList = storedIDList;
	var cityLength = cityIDList.length;
	
	//random gen states
	var randNum = 0;
	var randCityID = 0;

	//API ID
	var APPID = "b5e65ae554c826b7a756605c6be424cb";

	//weather states
	var cityName;
	var cityCoord = {lat: 0, lng: 0};
	var tempK;
	var tempC;
	var tempF;
	var weatherState;
	var weatherStateString;
	var weatherData;

	//set a new random city
	this.setRandCity = function(){
		//generate random number, generate random city ID
		randNum = Math.random();
		for(var i = 0; i < cityLength; i++){
			if( i / cityLength <= randNum && randNum < (i + 1) / cityLength){
				randCityID = cityIDList[i];
				break;
			}
		}
		console.log(randCityID);
		//call API and store to fields
		$.getJSON("http://api.openweathermap.org/data/2.5/weather?id=" + randCityID + "&APPID=" + APPID, function(data){
			weatherData = data;
			console.log(weatherData);

			//parse data from JSON
			cityName = data.name;
			cityCoord = {lat: parseFloat(data.coord.lat), lng: parseFloat(data.coord.lon)};
			tempK = data.main.temp;
			weatherState = data.weather[0].id;

			//convert temperature and store as integers
			tempC = tempK - 273.15;
			tempF = Math.round(tempC * 1.8 + 32);
			tempC = Math.round(tempC);

			//store weather state string relative to the id.
			weatherStateString = weatherStateList[weatherState];
		});
	}

	this.getCityName = function(){
		//return string of city name
		console.log(cityName);
		return cityName;
	}

	this.getCoord = function(){
		//return array with [latitude, longitude]
		console.log(cityCoord);
		return cityCoord;
	}

	this.getTempC = function(){
		//return temperature in celsius (int)
		console.log(tempC + " celsius");
		return tempC;
	}

	this.getTempF = function(){
		//return temperature in fahrenheit (int)
		console.log(tempF + " fahrenheit");
		return tempF;
	}

	this.getWeather = function(){
		//return weather as a string
		console.log(weatherState);
		console.log(weatherStateString);
		return weatherStateString;
	}
}

var MapAPI = function() {
	//options for google maps API V3
	var LatLng = {lat: 0, lng: 0};

	var myOptions = {
         zoom: 5,
         center: {lat: 0, lng: 0},
         mapTypeId: google.maps.MapTypeId.ROADMAP,
         disableDefaultUI: true,

    };

    //set the coordinate for the map
    this.setCoord = function( aLatLng){
    	myOptions.center = aLatLng;
    	LatLng = aLatLng;
    }

    //set the zoom level for the map
    this.setZoom = function(aZoom){
    	myOptions.zoom = aZoom;
    }

    //set the imbedded map to the stored options
    this.setMap = function(){
    	var map = new google.maps.Map(document.getElementById("map"), myOptions);
    	var marker = new google.maps.Marker({
    		position: LatLng,
    		map: map,
    		title: 'Whether?'
  		});
    }
}

var UserInterface = function(game) {

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
		desc: [$("#forcast .desc.one"),
			   $("#forcast .desc.two")],
		currentDesc: 0,
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
		element.desc[element.currentDesc].text(d);
	}

	var handleIncrements = function(incrementX,
								    incrementY,
								    ratioX, ratioY) {

		var resetX = false;
		var resetY = false;

		if (Math.abs(incrementY) >= ratioY) {

			var inc = 1;
			var dt = inc * (incrementY / Math.abs(incrementY));

			game.changeTemperature(dt);

			resetY = true;
		}
		if (Math.abs(incrementX) >= ratioX) {

			if (incrementX > 0) { game.nextDesc() } 
			else { game.lastDesc() }

			resetX = true;
		}

		return [resetX, resetY];
	}

	$(window).on('keydown', function(event) {
		switch(event.keyCode) {
			case 37:
				game.lastDesc();
				break;
			case 38:
				game.changeTemperature(1);
				break;
			case 39:
				game.nextDesc();
				break;
			case 40:
				game.changeTemperature(-1);
		}
	}).on('mousewheel', function(event) {

		scrollIncrementX -= event.deltaX;
		scrollIncrementY -= event.deltaY;

		var resetXY =
		handleIncrements(scrollIncrementX,
						 scrollIncrementY,
						 SCROLL_DESC_RATIO,
						 SCROLL_TEMP_RATIO);

		if (resetXY[0]) { scrollIncrementX = 0 }
		if (resetXY[1]) { scrollIncrementY = 0 }
	});

	element.sidebar.bind('move', function(event) {

		dragIncrementX -= event.deltaX;
		dragIncrementY -= event.deltaY;

		var resetXY =
		handleIncrements(dragIncrementX,
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
		temp: 52,
		desc: ["One", "Two", "Three"],
		descId: 1
	}
	
	var	userInterface = new UserInterface(this);

	var setCity = function(c) { city = c }
	var setCountry = function(c) { country = c }
	this.changeTemperature = function(dt) { 
		state.temp += dt;
		userInterface.setTemperature(state.temp);
	}

	var updateDesc = function(dir) {
		if (state.descId >= state.desc.length) { state.descId = 0 }
		else if (state.descId < 0) { state.descId = state.desc.length-1 }

		var newDesc = state.desc[state.descId]
		userInterface.setDescription(newDesc, dir);
	}

	this.nextDesc = function() {
		state.descId += 1;
		updateDesc(userInterface.DIRECTION_RIGHT);
	}
	this.lastDesc = function() {
		state.descId -= 1;
		updateDesc(userInterface.DIRECTION_LEFT);
	}


	userInterface.setCity(state.city);
	userInterface.setCountry(state.country);
	userInterface.setTemperature(state.temp);
	var newDesc = state.desc[state.descId];
	userInterface.setDescription(newDesc);
}

$(document).ready(function() {
<<<<<<< HEAD
	var userInterface = new UserInterface();
	var weatherAPI = new WeatherAPI();
	var mapAPI = new MapAPI();

	//delay required to allow API to finish
	weatherAPI.setRandCity();
	setTimeout(function(){
		weatherAPI.getCityName();
		weatherAPI.getCoord();
		weatherAPI.getTempC();
		weatherAPI.getTempF();
		weatherAPI.getWeather();
	}, 500);

	setTimeout(function(){
		mapAPI.setCoord(weatherAPI.getCoord());
		mapAPI.setMap();
	}, 1000);

=======
	var whether = new Game();
	console.log(whether);
>>>>>>> interface
});