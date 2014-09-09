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
		var y;
		
		if(err)
		{
			console.log("Bad image path " + filename);
			return;
		}
//		console.log("got pixels", pixels.shape.slice());
		
		// look to see if this is an animated image and if so then loop it 
		var dimensions = pixels.shape.slice();
		
		if( dimensions.length === 4 )
		{
			var imageIx;
			
			for(imageIx = 0 ; imageIx < dimensions[0] ; imageIx++)
			{
				var image = pixels.pick(imageIx, null, null, null);
				ledCeiling.writeImage(image);
			}
		}
		else
		{
			// loop the image up from the bottom

			console.log("pixels " + pixels.shape.slice());
	
			for( y = 47 ; y >= 0 ; y-- )
			{
				ledCeiling.writeImageWithOffset(pixels, 0, 0, 0, y, 0, 0);
			}
		}
	});