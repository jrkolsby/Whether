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

$(document).ready(function() {
	var userInterface = new UserInterface();
	userInterface.setTemperature(100);
});