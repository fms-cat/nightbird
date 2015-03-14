Nightbird.Connector = function( _nightbird, _isOutput, _type ){

	var connector = this;

	connector.nightbird = _nightbird;
	connector.isOutput = _isOutput;
	connector.type = _type;

	connector.posX = 0;
	connector.posY = 0;
	connector.radius = 5;

};

Nightbird.Connector.prototype.move = function( _x, _y ){

	var connector = this;

	connector.posX = _x;
	connector.posY = _y;

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

};
