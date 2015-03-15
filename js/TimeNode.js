Nightbird.TimeNode = function( _nightbird ){

	var timeNode = this;

	Nightbird.Node.call( timeNode, _nightbird );
	timeNode.name = 'Time';
	timeNode.width = 100;
	timeNode.height = 50;

	timeNode.begint = +new Date();
	timeNode.time = 0;

	var outputValue = new Nightbird.Connector( timeNode.nightbird, true, 'number' );
	outputValue.setName( 'time' );
	outputValue.onTransfer = function(){
		return Number( timeNode.time );
	};
	timeNode.outputs.push( outputValue );
	timeNode.move();

};

Nightbird.TimeNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.TimeNode.prototype.constructor = Nightbird.TimeNode;

Nightbird.TimeNode.prototype.operateDown = function( _x, _y ){

	var timeNode = this;

	if( Math.abs( _x-30 ) < 19 && Math.abs( _y-38 ) < 6 ){
		timeNode.operateNudge = true;
		timeNode.operateBeginY = _y;
		timeNode.operateBeginBegint = timeNode.begint;
		return true;
	}
	if( Math.abs( _x-70 ) < 19 && Math.abs( _y-38 ) < 6 ){
		timeNode.operateReset = true;
		timeNode.begint = +new Date();
		return true;
	}
	return false;

};

Nightbird.TimeNode.prototype.operateMove = function( _x, _y ){

	var timeNode = this;

	if( timeNode.operateNudge ){
		timeNode.begint = timeNode.operateBeginBegint + _y-timeNode.operateBeginY;
	}

};

Nightbird.TimeNode.prototype.operateUp = function(){

	var timeNode = this;

	if( timeNode.operateNudge ){
		timeNode.operateNudge = false;
	}
	if( timeNode.operateReset ){
		timeNode.operateReset = false;
	}

};

Nightbird.TimeNode.prototype.draw = function(){

	var timeNode = this;

	if( timeNode.active ){
		timeNode.time = ( +new Date() - timeNode.begint )*1e-3;
	}

	timeNode.nightbird.modularContext.fillStyle = '#333';
	timeNode.nightbird.modularContext.fillRect( timeNode.posX, timeNode.posY, timeNode.width, timeNode.height );
	timeNode.nightbird.modularContext.fillStyle = timeNode.operateNudge ? '#777' : '#555';
	timeNode.nightbird.modularContext.fillRect( timeNode.posX+11, timeNode.posY+32, 38, 12 );
	timeNode.nightbird.modularContext.fillStyle = timeNode.operateReset ? '#777' : '#555';
	timeNode.nightbird.modularContext.fillRect( timeNode.posX+51, timeNode.posY+32, 38, 12 );
	timeNode.nightbird.modularContext.fillStyle = '#ddd';
	timeNode.nightbird.modularContext.textAlign = 'center';
	timeNode.nightbird.modularContext.textBaseline = 'middle';
	timeNode.nightbird.modularContext.fillText( String( timeNode.time.toFixed(3) ), timeNode.posX+50, timeNode.posY+20 );
	timeNode.nightbird.modularContext.fillText( timeNode.nudgeText ? timeNode.nudgeText : 'Nudge', timeNode.posX+30, timeNode.posY+38 );
	timeNode.nightbird.modularContext.fillText( 'Reset', timeNode.posX+70, timeNode.posY+38 );

	Nightbird.Node.prototype.draw.call( timeNode );

};
