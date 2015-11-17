var UserInterface = function() {
	$(window).on('mousewheel', function(event, delta) {
		console.log(event.originalEvent.deltaY);
	});
}

$(function(){
	var userInterface = new UserInterface();
});