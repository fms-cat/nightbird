Node = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = 'Value';
	it.width = 100;
	it.height = 30;

	it.value = 0;

	var outputValue = new Nightbird.Connector( it, true, 'number' );
	outputValue.setName( 'value' );
	outputValue.onTransfer = function(){
		return Number( it.value );
	};
	it.outputs.push( outputValue );
	it.move();

};

Node.prototype = Object.create( Nightbird.Node.prototype );
Node.prototype.constructor = Node;

Node.prototype.operateDown = function( _x, _y ){

	var it = this;

	if( Math.abs( 50-_x ) < 30 && Math.abs( 20-_y ) < 6 ){
		if( it.lastClick && it.nightbird.time-it.lastClick < .3 ){
			it.nightbird.textbox = new Nightbird.Textbox( it.nightbird, it.value, function( _value ){
				it.value = Number( _value );
			} );
		}else{
			it.lastClick = it.nightbird.time;
			it.operateBeginY = _y;
			it.operateBeginValue = it.value;
			it.operate = true;
		}
		return true;
	}else{
		return false;
	}

};

Node.prototype.operateMove = function( _x, _y ){

	var it = this;

	if( it.operate ){
		it.value = Number( ( it.operateBeginValue+(it.operateBeginY-_y)*.01 ).toFixed(3) );
	}

};

Node.prototype.operateUp = function(){

	var it = this;

	it.operate = false;

};

Node.prototype.draw = function(){

	var it = this;

	it.nightbird.modularContext.fillStyle = '#333';
	it.nightbird.modularContext.fillRect( it.posX, it.posY, it.width, it.height );
	it.nightbird.modularContext.fillStyle = it.operate ? '#777' : '#555';
	it.nightbird.modularContext.fillRect( it.posX+20, it.posY+14, 60, 12 );
	it.nightbird.modularContext.fillStyle = '#ddd';
	it.nightbird.modularContext.textAlign = 'center';
	it.nightbird.modularContext.textBaseline = 'middle';
	it.nightbird.modularContext.fillText( it.value.toFixed(3), it.posX+50, it.posY+20 );

	Nightbird.Node.prototype.draw.call( it );

};
