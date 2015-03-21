Node = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = 'Leap';
	it.width = 100;
	it.height = 50;

	it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.nightbird.width;
	it.canvas.height = it.nightbird.height;

	it.context = it.canvas.getContext( '2d' );

	it.hands = [];
	it.handPos = [];
	it.handPos[0] = 0;
	it.handPos[1] = 0;
	it.handPos[2] = 0;

	it.leap = new Leap.Controller();
	it.leap.on( 'animationFrame', function( _frame ){
		var hands = _frame.hands;
		if( 0 < hands.length ){
			it.handDetected = true;
			it.handPos = hands[0].palmPosition;
		}else{
			it.handDetected = false;
		}
	} );
	it.connected = false;

	it.state = '';

	( function(){
		var output = new Nightbird.Connector( it, true, 'number' );
		output.setName( 'x' );
		output.onTransfer = function(){
			return Number( it.handPos[0] );
		};
		it.outputs.push( output );
	}() );
	( function(){
		var output = new Nightbird.Connector( it, true, 'number' );
		output.setName( 'y' );
		output.onTransfer = function(){
			return Number( it.handPos[1] );
		};
		it.outputs.push( output );
	}() );
	( function(){
		var output = new Nightbird.Connector( it, true, 'number' );
		output.setName( 'z' );
		output.onTransfer = function(){
			return Number( it.handPos[2] );
		};
		it.outputs.push( output );
	}() );
	it.move();

};

Node.prototype = Object.create( Nightbird.Node.prototype );
Node.prototype.constructor = Node;

Node.prototype.draw = function(){

	var it = this;

	if( it.active && !it.connected ){
		it.leap.connect();
		it.connected = true;
	}
	if( !it.active && it.connected ){
		it.leap.disconnect();
		it.connected = false;
	}

	it.nightbird.modularContext.fillStyle = '#333';
	it.nightbird.modularContext.fillRect( it.posX, it.posY, it.width, it.height );

	it.nightbird.modularContext.fillStyle = it.handDetected ? '#ddd' : '#888';
	it.nightbird.modularContext.textAlign = 'center';
	it.nightbird.modularContext.textBaseline = 'middle';
	it.nightbird.modularContext.fillText( 'x = '+it.handPos[0].toFixed(3), it.posX+50, it.posY+it.height-30 );
	it.nightbird.modularContext.fillText( 'y = '+it.handPos[1].toFixed(3), it.posX+50, it.posY+it.height-20 );
	it.nightbird.modularContext.fillText( 'z = '+it.handPos[2].toFixed(3), it.posX+50, it.posY+it.height-10 );

	Nightbird.Node.prototype.draw.call( it );

};
