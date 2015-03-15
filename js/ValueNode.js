Nightbird.ValueNode = function( _nightbird ){

	var valueNode = this;

	Nightbird.Node.call( valueNode, _nightbird );
	valueNode.name = 'Value';
	valueNode.width = 100;
	valueNode.height = 30;

	valueNode.value = 0.3;

	var outputValue = new Nightbird.Connector( valueNode.nightbird, true, 'number' );
	outputValue.setName( 'value' );
	outputValue.onTransfer = function(){
		return Number( valueNode.value );
	};
	valueNode.outputs.push( outputValue );
	valueNode.move();

};

Nightbird.ValueNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.ValueNode.prototype.constructor = Nightbird.ValueNode;

Nightbird.ValueNode.prototype.operateDown = function( _x, _y ){

	var valueNode = this;

	if( Math.abs( valueNode.width/2-_x ) < 30 && Math.abs( 10+(valueNode.height-10)/2-_y ) < 6 ){
		if( valueNode.lastClick && valueNode.nightbird.time-valueNode.lastClick < .3 ){
			valueNode.nightbird.textbox = new Nightbird.Textbox( valueNode.nightbird, valueNode.value, function( _value ){
				valueNode.value = Number( _value );
			} );
			valueNode.nightbird.textbox.move( valueNode.posX+_x, valueNode.posY+_y );
		}else{
			valueNode.lastClick = valueNode.nightbird.time;
			valueNode.operateBeginY = _y;
			valueNode.operateBeginValue = valueNode.value;
			valueNode.operate = true;
		}
		return true;
	}else{
		return false;
	}

};

Nightbird.ValueNode.prototype.operateMove = function( _x, _y ){

	var valueNode = this;

	if( valueNode.operate ){
		valueNode.value = Number( ( valueNode.operateBeginValue+(valueNode.operateBeginY-_y)*.01 ).toFixed(3) );
	}

};

Nightbird.ValueNode.prototype.operateUp = function(){

	var valueNode = this;

	valueNode.operate = false;

};

Nightbird.ValueNode.prototype.draw = function(){

	var valueNode = this;

	valueNode.nightbird.modularContext.fillStyle = '#333';
	valueNode.nightbird.modularContext.fillRect( valueNode.posX, valueNode.posY, valueNode.width, valueNode.height );
	valueNode.nightbird.modularContext.fillStyle = valueNode.operate ? '#777' : '#555';
	valueNode.nightbird.modularContext.fillRect( valueNode.posX+valueNode.width/2-30, valueNode.posY+10+(valueNode.height-10)/2-6, 60, 12 );
	valueNode.nightbird.modularContext.fillStyle = '#ddd';
	valueNode.nightbird.modularContext.textAlign = 'center';
	valueNode.nightbird.modularContext.textBaseline = 'middle';
	valueNode.nightbird.modularContext.fillText( valueNode.value.toFixed(3), valueNode.posX+valueNode.width/2, valueNode.posY+10+(valueNode.height-10)/2 );

	Nightbird.Node.prototype.draw.call( valueNode );

};
