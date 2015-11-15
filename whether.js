var weather = {

}

function UserInterface() {

	// Public fields
	this.TEMP_TAG = "h1";
	this.DESC_TAG = "h2";

	// Private fields
	var top = $('.option#top'),
		bottom = $('.option#bottom'),

		topTemp = top.children(this.TEMP_TAG),
		topDesc = top.children(this.DESC_TAG),

		bottomTemp = bottom.children(this.TEMP_TAG),
		bottomDesc = bottom.children(this.DESC_TAG)

	// Public methods
	this.removeTop = function() {
		top.remove();
	}

	// Private methods
	var removeTop = function() {
		top.remove();
	}
}

$(function(){
	// Main loop
	var userInterface = new UserInterface();
	userInterface.removeTop();
	console.log(userInterface.TEMP_TAG);
});