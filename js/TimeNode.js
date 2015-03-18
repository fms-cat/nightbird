Nightbird.TimeNode = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = 'Time';
	it.width = 100;
	it.height = 50;

	it.begint = +new Date();
	it.time = 0;

	var outputValue = new Nightbird.Connector( it.nightbird, true, 'number' );
	outputValue.setName( 'time' );
	outputValue.onTransfer = function(){
		return Number( it.time );
	};
	it.outputs.push( outputValue );
	it.move();

};

Nightbird.TimeNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.TimeNode.prototype.constructor = Nightbird.TimeNode;

Nightbird.TimeNode.prototype.operateDown = function( _x, _y ){

	var it = this;

	if( Math.abs( _x-30 ) < 19 && Math.abs( _y-38 ) < 6 ){
		it.operateNudge = true;
		it.operateBeginY = _y;
		it.operateBeginBegint = it.begint;
		return true;
	}
	if( Math.abs( _x-70 ) < 19 && Math.abs( _y-38 ) < 6 ){
		it.operateReset = true;
		it.begint = +new Date();
		return true;
	}
	return false;

};

Nightbird.TimeNode.prototype.operateMove = function( _x, _y ){

	var it = this;

	if( it.operateNudge ){
		it.begint = it.operateBeginBegint + _y-it.operateBeginY;
	}

};

Nightbird.TimeNode.prototype.operateUp = function(){

	var it = this;

	if( it.operateNudge ){
		it.operateNudge = false;
	}
	if( it.operateReset ){
		it.operateReset = false;
	}

};

Nightbird.TimeNode.prototype.draw = function(){

	var it = this;

	if( it.active ){
		it.time = ( +new Date() - it.begint )*1e-3;
	}

	it.nightbird.modularContext.fillStyle = '#333';
	it.nightbird.modularContext.fillRect( it.posX, it.posY, it.width, it.height );
	it.nightbird.modularContext.fillStyle = it.operateNudge ? '#777' : '#555';
	it.nightbird.modularContext.fillRect( it.posX+11, it.posY+32, 38, 12 );
	it.nightbird.modularContext.fillStyle = it.operateReset ? '#777' : '#555';
	it.nightbird.modularContext.fillRect( it.posX+51, it.posY+32, 38, 12 );
	it.nightbird.modularContext.fillStyle = '#ddd';
	it.nightbird.modularContext.textAlign = 'center';
	it.nightbird.modularContext.textBaseline = 'middle';
	it.nightbird.modularContext.fillText( String( it.time.toFixed(3) ), it.posX+50, it.posY+20 );
	it.nightbird.modularContext.fillText( it.nudgeText ? it.nudgeText : 'Nudge', it.posX+30, it.posY+38 );
	it.nightbird.modularContext.fillText( 'Reset', it.posX+70, it.posY+38 );

	Nightbird.Node.prototype.draw.call( it );

};
