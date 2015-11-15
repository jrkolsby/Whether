var weather = {

}

var UserInterface = function() {
	this.TEMP_TAG = "h1";
	this.DESC_TAG = "h2";
	this.OPTION_ID = ".option";

	var options = [];

	for (var i = 0; i < $(this.OPTION_ID).length; i++) {
		var currentOption = $(this.OPTION_ID + ":eq(" + i + ")");
		options[i] = {
			outer: currentOption,
			temp: currentOption.children(this.TEMP_TAG),
			desc: currentOption.children(this.DESC_TAG)
		}
	}

	this.setForcast = function(index, temp, desc) {
		options[index].temp.text(temp);
		options[index].desc.text(desc);
	}

	/* Sets the option's background given a
	 * hex code
	 */
	this.setBackground = function(index, hex) {
		if (hex.charAt(0) !== "#") {
			hex = "#" + hex;
		}
		options[index].outer.css({
			background: hex
		});
	}
}

$(function(){
	var userInterface = new UserInterface();
	userInterface.setForcast(0, 69, "eyyy");
	userInterface.setBackground(0, "#00ff00");
});