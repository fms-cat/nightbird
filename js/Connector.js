Nightbird.Connector = function( _nightbird, _isOutput, _type ){

	var it = this;

	it.nightbird = _nightbird;
	it.isOutput = _isOutput;
	it.type = _type;

	it.posX = 0;
	it.posY = 0;
	it.radius = 5.2;

	it.links = [];

	it.name = '';

};

Nightbird.Connector.prototype.setName = function( _name ){

	var it = this;

	it.name = _name;

};

Nightbird.Connector.prototype.move = function( _x, _y ){

	var it = this;

	it.posX = _x;
	it.posY = _y;

};

Nightbird.Connector.prototype.setLink = function( _link ){

	var it = this;

	it.links.push( _link );

};

Nightbird.Connector.prototype.removeLink = function( _link ){

	var it = this;

	it.links.splice( it.links.indexOf( _link ), 1 );

};

Nightbird.Connector.prototype.draw = function(){

	var it = this;

	it.nightbird.modularContext.beginPath();
	it.nightbird.modularContext.arc( it.posX, it.posY, it.radius, 0, 7, false );
	var col;
	switch( it.type ){
		case 'canvas' : col = '#06f'; break;
		case 'number' : col = '#f06'; break;
	}
	it.nightbird.modularContext.fillStyle = col;
	it.nightbird.modularContext.fill();
	it.nightbird.modularContext.lineWidth = 1;
	it.nightbird.modularContext.strokeStyle = '#000';
	it.nightbird.modularContext.stroke();

	if( it.links.length == 0 ){
		it.nightbird.modularContext.textAlign = it.isOutput ? 'left' : 'right';
		it.nightbird.modularContext.textBaseline = 'middle';
		it.nightbird.modularContext.fillStyle = '#ddd';
		it.nightbird.modularContext.fillText( '   '+it.name+'   ', it.posX, it.posY );
	};

};
