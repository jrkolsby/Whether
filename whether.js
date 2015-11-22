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

var UserInterface = function() {

	var SCROLL_TEMP_RATIO = 20;

	var element = {
		city: $("#sidebar h1"),
		country: $("#sidebar h4"),
		temp: $("#forcast .temp"),
		desc: $("#forcast .desc"),
		icon: $("#forcast .icon")
	},
		scrollIncrement = 0;

	this.setTemperature = function(t) { element.temp.text(t) }
	this.setCity = function(c) { element.city.text(c) }
	this.setCountry = function(c) { element.country.text(c) }

	$(window).on('mousewheel', function(event, delta) {
		scrollIncrement += event.originalEvent.deltaY;
		if (scrollIncrement >= SCROLL_TEMP_RATIO) {

		}
	});
}

var Game = function() {
	var city = "";
	var country = "";
	var temp = 69;
	var desc = [];
	var descId = 0;

	this.setCity = function(c) { city = c }
	this.setCountry = function(c) { country = c }
	this.setTemperature = function(t) { temp = t }
	this.setDescId = function(id) { descId = id }
}

$(document).ready(function() {
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

});