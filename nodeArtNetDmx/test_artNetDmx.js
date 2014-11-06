/**
 * 
 */
var util = require("util");
var ledCeiling = require('./ledCeiling.js');
var getPixels = require("get-pixels");
var filename;
var animateCnt = 0;

var images = [];
var curImage;
var imageIx = 0;
var imgYOff = 47;

function animate() {
	++animateCnt;
	
	if( curImage === undefined )
	{
		if( images.length >= 1 )
		{
//	console.log("got pixels", pixels.shape.slice());

			curImage = images.shift();
		}
		else
		{
			return 0;
		}
	}
	
	if( curImage === undefined )
	{
		return 0;
	}
	
	// look to see if this is an animated image and if so then loop it 
	var dimensions = curImage.shape.slice();
	
	if( dimensions.length === 4 )
	{
		// this is an animated GIF
		
		if( imageIx < dimensions[0] )
		{
			var image = curImage.pick(imageIx, null, null, null);
			ledCeiling.writeImage(image);
			imageIx++;
		}

		if( imageIx >= dimensions[0] )
		{
			curImage = undefined;
			imageIx = 0;
		}
	}
	else
	{
		if( imgYOff < 0 )
		{
			curImage = undefined;
			imgYOff = 47;
		}
		else
		{
			ledCeiling.writeImageWithOffset(curImage, 0, 0, 0, imgYOff--, 0, 0);
		}
	}
	
	/* We did something, let our caller know we want an update */
	
	return 1;
}

function imageRead(err, pixels) {
	var y;
	
	if(err)
	{
		console.log("Bad image path " + filename);
		return;
	}
	else
	{
		images.push(pixels);
	}
}

	ledCeiling.setup(animate, 100);
	
	if( process.argv[2] === undefined )
	{
		filename = "c:\\Users\\mlw\\Downloads\\ifl-ceil.jpg";
	}
	else
	{
		filename = process.argv[2];
	}

	getPixels(filename, imageRead);
