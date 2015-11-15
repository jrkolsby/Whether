var weather = {

}

function UserInterface() {
	// Private fields
	var top = $('.option#top');
	var bottom = $('.option#bottom');

	// Public fields
	this.removeTop = function() {
		top.remove();
	}
}

$(function(){
	var userInterface = new UserInterface();
	userInterface.removeTop();
});