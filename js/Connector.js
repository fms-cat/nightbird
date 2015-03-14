Nightbird.Connector = function( _nightbird, _isOutput, _type ){

	var connector = this;

	connector.nightbird = _nightbird;
	connector.isOutput = _isOutput;
	connector.type = _type;

	connector.posX = 0;
	connector.posY = 0;
	connector.radius = 5;

	connector.link = null;

	connector.name = '';

};

Nightbird.Connector.prototype.setName = function( _name ){

	var connector = this;

	connector.name = _name;

};

Nightbird.Connector.prototype.move = function( _x, _y ){

	var connector = this;

	connector.posX = _x;
	connector.posY = _y;

};

Nightbird.Connector.prototype.setLink = function( _link ){

	var connector = this;

	connector.link = _link;

};

Nightbird.Connector.prototype.removeLink = function(){

	var connector = this;

	connector.link = null;

};

Nightbird.Connector.prototype.draw = function(){

	var connector = this;

	connector.nightbird.modularContext.beginPath();
	connector.nightbird.modularContext.arc( connector.posX, connector.posY, connector.radius, 0, 7, false );
	var col;
	switch( connector.type ){
		case 'canvas' : col = '#06f'; break;
		case 'number' : col = '#f06'; break;
	}
	connector.nightbird.modularContext.fillStyle = col;
	connector.nightbird.modularContext.fill();
	connector.nightbird.modularContext.lineWidth = 1;
	connector.nightbird.modularContext.strokeStyle = '#000';
	connector.nightbird.modularContext.stroke();

	if( !connector.link ){
		connector.nightbird.modularContext.textAlign = connector.isOutput ? 'left' : 'right';
		connector.nightbird.modularContext.textBaseline = 'middle';
		connector.nightbird.modularContext.fillStyle = '#ddd';
		connector.nightbird.modularContext.fillText( '   '+connector.name+'   ', connector.posX, connector.posY );
	};

};
