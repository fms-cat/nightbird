Node = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = 'LeapCanvas';
	it.width = 100;
	it.height = 10+100*it.nightbird.height/it.nightbird.width+40;

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
		it.hands = _frame.hands;
	} );

	it.connected = false;

	it.state = '';

	( function(){
		var output = new Nightbird.Connector( it, true, 'canvas' );
		output.setName( 'canvas' );
		output.onTransfer = function(){
			return it.canvas;
		};
		it.outputs.push( output );
	}() );
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

	if( it.active ){
		if( 0 < it.hands.length ){
			it.handDetected = true;
			it.handPos = it.hands[0].palmPosition;
		}else{
			it.handDetected = false;
		}

		it.context.clearRect( 0, 0, it.canvas.width, it.canvas.height );
		it.context.strokeStyle = '#fff';
		it.context.lineCap = 'round';
		it.context.lineJoin = 'round';
		it.context.lineWidth = 4;
		for( var hand of it.hands ){
			console.log(hand);
			var palmPos = hand.palmPosition;
			for( var finger of hand.fingers ){
				it.context.beginPath();
				it.context.setTransform( 1, 0, 0, -1, it.canvas.width/2, it.canvas.height/2 );
				it.context.moveTo( hand.arm.prevJoint[0], (hand.arm.prevJoint[0]-200) );
				it.context.lineTo( hand.arm.nextJoint[0], (hand.arm.nextJoint[0]-200) );
				it.context.lineTo( palmPos[0], (palmPos[1]-200) );
				for( var ip=0; ip<finger.positions.length; ip++ ){
					var pos = finger.positions[ip];
					it.context.lineTo( pos[0], (pos[1]-200) );
				}
				it.context.stroke();
				it.context.setTransform( 1, 0, 0, 1, 0, 0 );
			}
		}
	}

	it.nightbird.modularContext.fillStyle = '#333';
	it.nightbird.modularContext.fillRect( it.posX, it.posY, it.width, it.height );

	it.nightbird.modularContext.fillRect( it.posX, it.posY+10, it.width, it.height-50 );
	it.nightbird.modularContext.drawImage( it.canvas, it.posX, it.posY+10, it.width, it.height-50 );

	it.nightbird.modularContext.fillStyle = it.handDetected ? '#ddd' : '#888';
	it.nightbird.modularContext.textAlign = 'center';
	it.nightbird.modularContext.textBaseline = 'middle';
	it.nightbird.modularContext.fillText( 'x = '+it.handPos[0].toFixed(3), it.posX+50, it.posY+it.height-30 );
	it.nightbird.modularContext.fillText( 'y = '+it.handPos[1].toFixed(3), it.posX+50, it.posY+it.height-20 );
	it.nightbird.modularContext.fillText( 'z = '+it.handPos[2].toFixed(3), it.posX+50, it.posY+it.height-10 );

	Nightbird.Node.prototype.draw.call( it );

};
