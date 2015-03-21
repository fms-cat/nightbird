Node = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );

	it.name = 'Text';
	it.width = 100;
	it.height = 10+100*it.nightbird.height/it.nightbird.width;

	it.text = '';
	it.font = '';

	it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.nightbird.width;
	it.canvas.height = it.nightbird.height;

	it.context = it.canvas.getContext( '2d' );

	var outputCanvas = new Nightbird.Connector( it, true, 'canvas' );
	outputCanvas.setName( 'output' );
	outputCanvas.onTransfer = function(){
		return it.canvas;
	};
	it.outputs.push( outputCanvas );
	it.move();
	var inputText = new Nightbird.Connector( it, false, 'string' );
	inputText.setName( 'text' );
	inputText.onTransfer = function( _data ){
		it.text = _data;
	};
	it.inputs.push( inputText );
	it.move();
	var inputFont = new Nightbird.Connector( it, false, 'string' );
	inputFont.setName( 'font' );
	inputFont.onTransfer = function( _data ){
		it.font = _data;
	};
	it.inputs.push( inputFont );
	it.move();

};

Node.prototype = Object.create( Nightbird.Node.prototype );
Node.prototype.constructor = Node;

Node.prototype.draw = function(){

	var it = this;

	if( it.active ){
		it.context.clearRect( 0, 0, it.canvas.width, it.canvas.height );
		if( it.font ){
			it.context.font = it.font;
		}else{
			it.context.font = '72px sans-serif';
		}
		it.context.fillStyle = '#fff';
		it.context.textAlign = 'center';
		it.context.textBaseline = 'middle';
		it.context.fillText( it.text, it.canvas.width/2, it.canvas.height/2 );
	}

	it.nightbird.modularContext.fillStyle = '#000';
	it.nightbird.modularContext.fillRect( it.posX, 10+it.posY, it.width, it.height-10 );
	it.nightbird.modularContext.drawImage( it.canvas, it.posX, 10+it.posY, it.width, it.height-10 );

	Nightbird.Node.prototype.draw.call( it );

};
