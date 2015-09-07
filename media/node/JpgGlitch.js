Node = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = 'jpg-glitch';
	it.width = 100;
	it.height = 10+100*it.nightbird.height/it.nightbird.width;

	it.preCanvas = document.createElement( 'canvas' );
	it.preCanvas.width = it.nightbird.width;
	it.preCanvas.height = it.nightbird.height;

	it.preContext = it.preCanvas.getContext( '2d' );

	it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.nightbird.width;
	it.canvas.height = it.nightbird.height;

	it.context = it.canvas.getContext( '2d' );

	it.input = null;

	it.params = {
		amount : 10,
		seed : 10,
		iterations : 10,
		quality : 10
	};

	var inputCanvas = new Nightbird.Connector( it, false, 'canvas' );
	inputCanvas.setName( 'input' );
	inputCanvas.onTransfer = function( _data ){
		it.input = _data;
	};
	it.inputs.push( inputCanvas );

	var inputAmount = new Nightbird.Connector( it, false, 'number' );
	inputAmount.setName( 'amount' );
	inputAmount.onTransfer = function( _data ){
		it.params.amount = Math.min( Math.max( Math.floor( _data * 100.0 ), 0.0 ), 99.0 );
	};
	it.inputs.push( inputAmount );

	var inputSeed = new Nightbird.Connector( it, false, 'number' );
	inputSeed.setName( 'seed' );
	inputSeed.onTransfer = function( _data ){
		it.params.seed = Math.min( Math.max( Math.floor( _data * 100.0 ), 0.0 ), 99.0 );
	};
	it.inputs.push( inputSeed );

	var inputIter = new Nightbird.Connector( it, false, 'number' );
	inputIter.setName( 'iter' );
	inputIter.onTransfer = function( _data ){
		it.params.iter = Math.max( Math.floor( _data * 100.0 ), 0.0 );
	};
	it.inputs.push( inputIter );

	var inputQuality = new Nightbird.Connector( it, false, 'number' );
	inputQuality.setName( 'quality' );
	inputQuality.onTransfer = function( _data ){
		it.params.quality = Math.min( Math.max( Math.floor( _data * 100.0 ), 1.0 ), 100.0 );
	};
	it.inputs.push( inputQuality );

	var outputCanvas = new Nightbird.Connector( it, true, 'canvas' );
	outputCanvas.setName( 'output' );
	outputCanvas.onTransfer = function(){
		return it.canvas;
	};
	it.outputs.push( outputCanvas );

	it.move();

};

Node.prototype = Object.create( Nightbird.Node.prototype );
Node.prototype.constructor = Node;

Node.prototype.save = function( _hashed ){

	var it = this;

	var obj = Nightbird.Node.prototype.save.call( it, _hashed );
	obj.params = it.params;
	return obj;

};

Node.prototype.draw = function(){

	var it = this;

	if( it.active && it.input ){

		var x = 0;
		var y = 0;
		var w = it.input.width;
		var h = it.input.height;
		if( w/it.canvas.width < h/it.canvas.height ){
			y = (h-(w*it.canvas.height/it.canvas.width))/2;
			h = w*it.canvas.height/it.canvas.width;
		}else{
			x = (w-(h*it.canvas.width/it.canvas.height))/2;
			w = h*it.canvas.width/it.canvas.height;
		}
		it.preContext.drawImage( it.input, x, y, w, h, 0, 0, it.canvas.width, it.canvas.height );

		var data = it.preContext.getImageData( 0, 0, it.canvas.width, it.canvas.height );
		glitch( data, it.params, function( _image ){
		  it.context.putImageData( _image, 0, 0 );
		} );

	}

	it.nightbird.modularContext.fillStyle = '#000000';
  it.nightbird.modularContext.fillRect( it.posX, 10+it.posY, it.width, it.height-10 );
	it.nightbird.modularContext.drawImage( it.canvas, it.posX, 10+it.posY, it.width, it.height-10 );

	Nightbird.Node.prototype.draw.call( it );

};
