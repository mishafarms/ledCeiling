/**
 * 
 */
var util = require("util");
var ideaFabLabs = require('./ideafablabs.js');
var getPixels = require("get-pixels");

	
	ideaFabLabs.setup();
	
	getPixels("c:\\Users\\mlw\\Downloads\\ifl-ceil2.jpg", function(err, pixels) {
		if(err)
		{
			console.log("Bad image path");
			return;
		}
		console.log("got pixels", pixels.shape.slice());
		ideaFabLabs.writeImage(pixels);
		});