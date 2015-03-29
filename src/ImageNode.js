Nightbird.ImageNode = function( _nightbird, _ab ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.width = 100;
	it.height = 10+100*it.nightbird.height/it.nightbird.width;

	it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.nightbird.width;
	it.canvas.height = it.nightbird.height;

	it.context = it.canvas.getContext( '2d' );

	it.image = new Image();

	it.loadImage( _ab );

	var outputCanvas = new Nightbird.Connector( it, true, 'canvas' );
	outputCanvas.setName( 'output' );
	outputCanvas.onTransfer = function(){
		return it.canvas;
	};
	it.outputs.push( outputCanvas );
	it.move();

};

Nightbird.ImageNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.ImageNode.prototype.constructor = Nightbird.ImageNode;

Nightbird.ImageNode.prototype.loadImage = function( _ab ){

	var it = this;

	var image = new Blob( [ _ab ] );
	it.image.src = window.URL.createObjectURL( image );

};

Nightbird.ImageNode.prototype.remove = function(){

	var it = this;

	window.URL.revokeObjectURL( it.image.src );
	Nightbird.Node.prototype.remove.call( it );

};

Nightbird.ImageNode.prototype.save = function( _hashed ){

	var it = this;

	var obj = Nightbird.Node.prototype.save.call( it, _hashed );
	obj.kind = 'ImageNode';
	return obj;

};

Nightbird.ImageNode.prototype.draw = function(){

	var it = this;

	if( it.active ){

		var x = 0;
		var y = 0;
		var w = it.image.width;
		var h = it.image.height;
		if( w/it.canvas.width < h/it.canvas.height ){
			y = (h-(w*it.canvas.height/it.canvas.width))/2;
			h = w*it.canvas.height/it.canvas.width;
		}else{
			x = (w-(h*it.canvas.width/it.canvas.height))/2;
			w = h*it.canvas.width/it.canvas.height;
		}
		it.context.drawImage( it.image, x, y, w, h, 0, 0, it.canvas.width, it.canvas.height );

	}

	it.nightbird.modularContext.drawImage( it.canvas, it.posX, 10+it.posY, it.width, it.height-10 );

	Nightbird.Node.prototype.draw.call( it );

};
