Node = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = 'Random';
	it.width = 100;
	it.height = 45;

	it.value = 0.0;
	it.min = 0.0;
	it.max = 1.0;

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

	if( Math.abs( 25-_x ) < 15 && Math.abs( 20-_y ) < 6 ){
		if( it.lastClick && it.nightbird.time-it.lastClick < .3 ){
			it.nightbird.textbox = new Nightbird.Textbox( it.nightbird, it.min, function( _value ){
				it.min = Number( _value );
			} );
		}else{
			it.lastClick = it.nightbird.time;
			it.operateBeginY = _y;
			it.operateBeginValue = it.min;
			it.operateMin = true;
		}
		return true;
	}else if( Math.abs( 75-_x ) < 15 && Math.abs( 20-_y ) < 6 ){
		if( it.lastClick && it.nightbird.time-it.lastClick < .3 ){
			it.nightbird.textbox = new Nightbird.Textbox( it.nightbird, it.max, function( _value ){
				it.max = Number( _value );
			} );
		}else{
			it.lastClick = it.nightbird.time;
			it.operateBeginY = _y;
			it.operateBeginValue = it.max;
			it.operateMax = true;
		}
		return true;
	}else{
		return false;
	}

};

Node.prototype.operateMove = function( _x, _y ){

	var it = this;

	if( it.operateMin ){
		it.min = Number( ( it.operateBeginValue+(it.operateBeginY-_y)*.1 ).toFixed(0) );
	}
	if( it.operateMax ){
		it.max = Number( ( it.operateBeginValue+(it.operateBeginY-_y)*.1 ).toFixed(0) );
	}

};

Node.prototype.operateUp = function(){

	var it = this;

	it.operateMin = false;
	it.operateMax = false;

};

Node.prototype.save = function( _hashed ){

	var it = this;

	var obj = Nightbird.Node.prototype.save.call( it, _hashed );
	obj.min = it.min;
	obj.max = it.max;
	return obj;

};

Node.prototype.draw = function(){

	var it = this;

	if( it.active ){
		it.value = it.min + Math.random() * ( it.max - it.min );
	}

	it.nightbird.modularContext.fillStyle = '#333';
	it.nightbird.modularContext.fillRect( it.posX, it.posY, it.width, it.height );
	it.nightbird.modularContext.fillStyle = it.operateMin ? '#777' : '#555';
	it.nightbird.modularContext.fillRect( it.posX+10, it.posY+14, 30, 12 );
	it.nightbird.modularContext.fillStyle = it.operateMax ? '#777' : '#555';
	it.nightbird.modularContext.fillRect( it.posX+60, it.posY+14, 30, 12 );
	it.nightbird.modularContext.fillStyle = '#ddd';
	it.nightbird.modularContext.textAlign = 'center';
	it.nightbird.modularContext.textBaseline = 'middle';
	it.nightbird.modularContext.fillText( it.min.toFixed(0), it.posX+25, it.posY+20 );
	it.nightbird.modularContext.fillText( it.max.toFixed(0), it.posX+75, it.posY+20 );
	it.nightbird.modularContext.fillText( '~', it.posX+50, it.posY+20 );
	it.nightbird.modularContext.fillText( it.value.toFixed(3), it.posX+50, it.posY+35 );

	Nightbird.Node.prototype.draw.call( it );

};
