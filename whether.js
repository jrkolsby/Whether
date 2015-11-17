var UserInterface = function(g) {

	var SCROLL_TEMP_RATIO = 50,
		SCROLL_DESC_RATIO = 100;

	var element = {
		city: $("#sidebar h1"),
		country: $("#sidebar h4"),
		temp: $("#forcast .temp"),
		desc: $("#forcast .desc"),
		icon: $("#forcast .icon")
	},
		scrollIncrementY = 0,
		scrollIncrementX = 0;

	this.setCity = function(c) { element.city.text(c) }
	this.setCountry = function(c) { element.country.text(c) }
	this.setTemperature = function(t) { element.temp.text(t) }
	this.setDescription = function(d) { element.desc.text(d) }

	$(window).on('mousewheel', function(event, delta) {

		scrollIncrementX += event.deltaX;
		scrollIncrementY += event.deltaY;

		if (Math.abs(scrollIncrementY) >= SCROLL_TEMP_RATIO) {

			var inc = 1;
			var dt = inc * (scrollIncrementY / Math.abs(scrollIncrementY));

			g.changeTemperature(dt);
			scrollIncrementY = 0;
		}
		if (Math.abs(scrollIncrementX) >= SCROLL_DESC_RATIO) {

			if (scrollIncrementX > 0) {
				g.nextDesc();
			} else {
				g.prevDesc();
			}
			scrollIncrementX = 0;
		}
	});
}

var Game = function() {
	var state = {
		city: "",
		country: "",
		temp: 69,
		desc: ["Cloudy", "Rainyish", "Meatballs"],
		descId: 0
	},
		userInterface = new UserInterface(this);

	this.setCity = function(c) { city = c }
	this.setCountry = function(c) { country = c }
	this.changeTemperature = function(dt) { 
		state.temp += dt;
		userInterface.setTemperature(state.temp);
	}

	var updateDesc = function() {
		/* TODO:
		 * - Replace with ternary statement
		 * - Learn what a ternary statement is
		 */
		if (state.descId >= state.desc.length) {
			state.descId = 0;
		} else if (state.descId < 0) {
			state.descId = state.desc.length-1;
		}

		var newDesc = state.desc[state.descId]
		userInterface.setDescription(newDesc);
	}

	this.nextDesc = function() {
		state.descId += 1;
		updateDesc();
	}
	this.prevDesc = function() {
		state.descId -= 1;
		updateDesc();
	}
}

$(document).ready(function() {
	var whether = new Game();
});