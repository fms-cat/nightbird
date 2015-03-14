Nightbird.MasterNode = function( _nightbird ){

	var masterNode = this;

	Nightbird.Node.call( masterNode, _nightbird );

	masterNode.nightbird = _nightbird;

	masterNode.canvas = document.createElement( 'canvas' );
	masterNode.canvas.width = 512;
	masterNode.canvas.height = 512;

	masterNode.input = null;

	masterNode.context = masterNode.canvas.getContext( '2d' );

	var inputCanvas = new Nightbird.Connector( masterNode.nightbird, false, 'canvas' );
	inputCanvas.setName( 'canvas' );
	inputCanvas.onTransfer = function( _data ){
		masterNode.input = _data;
	};
	masterNode.inputs.push( inputCanvas );
	masterNode.move();

};

Nightbird.MasterNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.MasterNode.prototype.constructor = Nightbird.MasterNode;

Nightbird.MasterNode.prototype.draw = function(){

	var masterNode = this;

	if( masterNode.input ){
		masterNode.context.drawImage( masterNode.input, 0, 0, masterNode.canvas.width, masterNode.canvas.height );
	}else{
		masterNode.context.fillRect( 0, 0, masterNode.canvas.width, masterNode.canvas.height );
	}

	var w = masterNode.width;
	var h = masterNode.height;
	masterNode.nightbird.modularContext.drawImage( masterNode.canvas, masterNode.posX, masterNode.posY, w, h );

	Nightbird.Node.prototype.draw.call( masterNode );

};
