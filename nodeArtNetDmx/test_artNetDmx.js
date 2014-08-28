/**
 * 
 */
var util = require("util");
var ledCeiling = require('./ledCeiling.js');
var getPixels = require("get-pixels");

	
	ledCeiling.setup();
	
	getPixels("c:\\Users\\mlw\\Downloads\\ifl-ceil.jpg", function(err, pixels) {
		if(err)
		{
			console.log("Bad image path");
			return;
		}
		console.log("got pixels", pixels.shape.slice());
		ledCeiling.writeImage(pixels);
		});