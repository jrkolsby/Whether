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
		desc: $("#forcast .desc"),
		icon: $("#forcast .icon")
	},
		scrollIncrementY = 0,
		scrollIncrementX = 0,
		dragIncrementY = 0,
		dragIncrementX = 0;

	this.setCity = function(c) { element.city.text(c) }
	this.setCountry = function(c) { element.country.text(c) }
	this.setTemperature = function(t) { element.temp.text(t) }
	this.setDescription = function(d, dir) {
		if (dir == this.DIRECTION_LEFT) {
			element.desc.addClass("left");
			element.desc.text(d);
			element.desc.removeClass("left");
		} else if (dir == this.DIRECTION_RIGHT) {
			element.desc.addClass("right");
			element.desc.text(d);
			element.desc.removeClass("right");			
		}
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
			else { game.prevDesc() }

			resetX = true;
		}

		return [resetX, resetY];
	}

	$(window).on('keydown', function(event) {
		switch(event.keyCode) {
			case 37:
				game.prevDesc();
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
		city: "Rio de Janeiro",
		country: "Brazil",
		temp: 69,
		desc: ["Cloudy", "Rainyish", "Meatballs"],
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
	this.prevDesc = function() {
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
	var whether = new Game();
});