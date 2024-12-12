"use strict";

// init label toggler
function toggleLabels() {
	if ($("#labelToggler").is(':checked'))
		$("g text").show();
	else
		$("g text").hide();
}

$("#labelToggler").change(function() {
	toggleLabels();
});

// apply cached toggler status
toggleLabels();
