/* jshint bitwise:false */

var artnetclient = require('./artNetDmx');

var WIDTH_PIXELS = 60;
var HEIGHT_PIXELS = 48;

var UNIS_PER_FULL_LINE = 2;
var LINES_PER_UNI = 3;
var PIXELS_PER_UNI = 90;

var uniData = [];  // empty array holds arrays of data
var hosts = []; // empty array holds artnet client
var ledMap;


function LedMap(len)
{
	var x;
	var y;
	var rightSide = 0;
	var uni;
	var led;

	if(len !== (WIDTH_PIXELS * HEIGHT_PIXELS))
	{
		return;
	}

	var ledMap = []; // create an empty array
	
    // for each line

	for( y = 0; y < HEIGHT_PIXELS; y++ )
	{
		// for each pixel

		for( x = 0; x < WIDTH_PIXELS; x++ )
		{
			var offset;

			// IFL ceiling map is made up of 8 identical controllers  mapped
			// one below the other each with 4 universes of 90 pixels each
			// the universes start in the middle of the Y and go out left and
			// right from there. Also we need to weave our way up and down
			// for how the panels are wired.

			// first pick the universe in the controller

			// divide y by 3 lines per universe times 2 for number of unis to
			// create a full line

			uni = UNIS_PER_FULL_LINE * Math.floor(y / LINES_PER_UNI);

			// we really need to see if we are in the left or right universe

			if( x >= Math.floor(WIDTH_PIXELS / 2) )
			{
				// we are in the second uni for this line

				uni++;
				rightSide = 1;
			}
			else
			{
				rightSide = 0;
			}

			// so now we know we side we are working on we can figure out
			// which LED we are in the IFL universes

			if( rightSide === 0 )
			{
				// we start from the middle LED as 0 and go up as we go left so
				// we need how many pixels we are from center.

				offset = (Math.floor(WIDTH_PIXELS / 2) - 1) - x;

				switch( y % LINES_PER_UNI )
				{
					// this seems complicated but we start with x=0/led=0
					// then x=1/led=5, x=2/led=6, x=3/led=11 this is because
					// of the wiring of the leds. Each case is different

					case 0:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 2 : 3);
					break;
					case 1:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 1 : 4);
					break;
					case 2:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 0 : 5);
					break;
					default:
					// not possible
					break;
				}
			}
			else
			{
				// we start from the middle LED as 0 and go up as we go right

				offset = x - Math.floor(WIDTH_PIXELS / 2);

				switch( y % LINES_PER_UNI )
				{
					// this seems complicated but we start with x=0/led=2
					// then x=1/led=3, x=2/led=8, x=3/led=9 this is because
					// of the wiring of the leds. Each case is different

					case 0:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 0 : 5);
					break;
					case 1:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 1 : 4);
					break;
					case 2:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 2 : 3);
					break;
					default:
					// not possible
					break;
				}
			}

			// we now have the universe and the led within the universe
			// we save them off into an array so that we can map a simple
			// X/Y grid into our leds and have it display  correctly

			var leds = {
					'uni': uni,
					'led': led * 3, // we have an array or red, green, blue, red, green, blue, ...
			};
			
			ledMap.push(leds);
		}
	}

	// we have a full map of pixel to uni/led we can hand this info back

	return ledMap;
}

function allocData(){
	var d = [];
	var x;
	
	for( x = 0 ; x < PIXELS_PER_UNI * 3 ; x++)
	{
		d.push(0);
	}
	
	return d;
}

var width = exports.width = function(){
	return WIDTH_PIXELS;
};

var height = exports.height = function(){
	return HEIGHT_PIXELS;
};

var sendAllUnis =  exports.sendAllUnis = function sendAllUnis()
{
	var uni;
	var host;
	
	for( uni = 0 ; uni < 4 ; uni++ )
	{
		for( host = 0 ; host < 8 ; host++ )
		{
			hosts[(host * 4) + uni].send(uniData[(host * 4) + uni]);
		}
	}
};

exports.setup = function()
{
	var host;
	
	// setup the led map now 
	
	ledMap = new LedMap(WIDTH_PIXELS * HEIGHT_PIXELS);
	
	// this is the order of hosts and universes for Idea Fab Labs ceiling
	
	for(host = 107 ; host >= 100 ; host--)
	{
		hosts.push(artnetclient.createClient("192.168.1."+host, 6454, 4));
		uniData.push(allocData());
		hosts.push(artnetclient.createClient("192.168.1."+host, 6454, 1));
		uniData.push(allocData());
		hosts.push(artnetclient.createClient("192.168.1."+host, 6454, 3));
		uniData.push(allocData());
		hosts.push(artnetclient.createClient("192.168.1."+host, 6454, 2));
		uniData.push(allocData());
	}

	// clear the leds
	
	sendAllUnis();
};

exports.setPixel = function(x, y, color)
{
	if( (x > WIDTH_PIXELS) || (y > HEIGHT_PIXELS) )
	{
		return; // there is nothing to do
	}

	var index = (y * WIDTH_PIXELS) + x;
	uniData[ledMap[index].uni][ledMap[index].led] = (color >> 16) & 0xff;
	uniData[ledMap[index].uni][ledMap[index].led + 1] = (color >> 8) & 0xff;
	uniData[ledMap[index].uni][ledMap[index].led + 2] = color & 0xff;
};

exports.writeImage = function(image)
{
	// get the image dimensions
	
	var dimensions = image.shape.slice();
	
	if(dimensions.length !== 3)
	{
		console.log("We can't handle images of " + dimensions.length + " dimensions");
		return;
	}
	
	// since this is a simple image 
	// find out which is larger, the image or our display
	
	var myHeight = Math.min(dimensions[0], HEIGHT_PIXELS);
	var myWidth = Math.min(dimensions[1], WIDTH_PIXELS);
	
	// for now just start at the top left corner and set pixels

	var y, x, z;
	
	for(y = 0 ; y < myHeight ; y++)
	{
		for(x = 0 ; x < myWidth ; x++)
		{
			var index = (y * WIDTH_PIXELS) + x;
			
//			console.log("x/y " + x + "/" + y + " ");

			for(z = 0 ; z < 3 ; z++)
			{
				uniData[ledMap[index].uni][ledMap[index].led + z] = image.get(y, x, z);
//				console.log(z + "[" + image.get(y, x, z) + "] ");
			}
		}
	}
	
	sendAllUnis();
};