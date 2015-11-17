var gameState = {
	city: "",
	country: "",
	temp: 0,
	desc: [],
	descId: 0
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