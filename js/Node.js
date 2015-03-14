Nightbird.Node = function( _nightbird, _file ){

	this.nightbird = _nightbird;

	this.canvas = document.createElement( 'canvas' );
	this.canvas.width = 128;
	this.canvas.height = 128;

	this.active = true;
	this.posX = 64;
	this.posY = 64;
	this.width = 128;
	this.height = 128;

};

Nightbird.Node.prototype.setSize = function( _w, _h ){

	this.canvas.width = _w;
	this.canvas.height = _h;

};

Nightbird.Node.prototype.draw = function(){

	var w = this.canvas.width;
	var h = this.canvas.height;
	this.nightbird.modularContext.drawImage( this.canvas, -w/2+this.posX, -h/2+this.posY, w, h );

};
