/**
 * 
 */
var util = require("util");
var ledCeiling = require('./ledCeiling.js');
var getPixels = require("get-pixels");
var filename;
	
	ledCeiling.setup();
	
	if( process.argv[2] === undefined )
	{
		filename = "c:\\Users\\mlw\\Downloads\\ifl-ceil.jpg";
	}
	else
	{
		filename = process.argv[2];
	}

	getPixels(filename, function(err, pixels) {
		if(err)
		{
			console.log("Bad image path " + filename);
			return;
		}
		console.log("got pixels", pixels.shape.slice());
		ledCeiling.writeImage(pixels);
		});