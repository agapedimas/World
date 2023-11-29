ADUX.disableExpand = true;
$(document).ready(function()
{	
	$(".titlebar").append("<div class='actions'></div>");
	$(".titlebar .actions").append("<div class='fullscreen' ad-tooltip='Enter full screen'></div>");
	$(".titlebar .actions .fullscreen").click(Fullscreen_Enter);
});