/* jshint bitwise:false */

var dgram = require('dgram');
var Buffer1 = require('buffer').Buffer;
var util = require('util');
var _socket;

var SEQ_OFF = 12;
var PHYS_OFF = 13;
var LEN_OFF = 16;
var DATA_OFF = 18;

var seq = 0;

function ArtNetClient(host, port, universe) {
	this._host = host;
	this._port = port;
	
	if (_socket === undefined )
	{
		_socket = dgram.createSocket("udp4");
	}
	
	this.dmx = new Buffer(18 + 512);
	this.dmx.fill(0);
	this.dmx.write("Art-Net", "utf-8");
	this.dmx[7] = 0;
	this.dmx[8] = 0;
	this.dmx[9] = 0x50;
	this.dmx[10] = 0;
	this.dmx[11] = 0xe;
	this.dmx[13] = 0; // 13
	this.dmx[14] = universe & 0xff; // 14
	this.dmx[15] = (universe >> 8) & 0xff; // 15
}
exports.ArtNetClient = ArtNetClient;

exports.createClient = function(host, port, universe) {
return new ArtNetClient(host, port, universe);
};

ArtNetClient.prototype.send = function(data) {
// Calculate the length
var length_upper = Math.floor(data.length / 256);
var length_lower = data.length % 256;
// set the sequence
this.dmx.writeUInt8(seq++, SEQ_OFF, 1);
// set the lenth to 512 always
this.dmx.writeUInt16BE(512, LEN_OFF, 1);

if (util.isArray(data))
{
	var x = 0;
	
	for(x = 0 ; x < data.length ; x++)
	{
		this.dmx[x + 18] = data[x];
	}
}

_socket.send(this.dmx, 0, this.dmx.length, this._port, this._host, function(){});
};

ArtNetClient.prototype.close = function(){
	console.log("we sent one buffer");
};