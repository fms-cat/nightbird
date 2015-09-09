Nightbird.Connector = function( _node, _isOutput, _type ){

	var it = this;

	it.node = _node;
	it.nightbird = it.node.nightbird;
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

	if( Nightbird.dist( it.nightbird.mouseX, it.nightbird.mouseY, it.posX, it.posY ) < it.radius ){
		it.radius = 7;
	}else{
		it.radius = 5;
	}

	it.nightbird.modularContext.beginPath();
	it.nightbird.modularContext.arc( it.posX, it.posY, it.radius, 0, 7, false );
	var col;
	switch( it.type ){
		case 'canvas' : col = '#06f'; break;
		case 'number' : col = '#f06'; break;
		case 'string' : col = '#fa0'; break;
	}
	if( 0 < it.nightbird.grabLinks.length ){
		if( it.nightbird.grabLinks[0].type === it.type && ( it.nightbird.grabLinks[0].grabEnd ^ it.isOutput ) ){
		}else{
			col = col.replace( 'f', '8' );
			col = col.replace( 'a', '5' );
			col = col.replace( '6', '3' );
		}
	}
	it.nightbird.modularContext.fillStyle = col;
	it.nightbird.modularContext.fill();
	it.nightbird.modularContext.lineWidth = 1;
	it.nightbird.modularContext.strokeStyle = '#000';
	it.nightbird.modularContext.stroke();

	if( it.links.length === 0 ){
		it.nightbird.modularContext.textAlign = it.isOutput ? 'left' : 'right';
		it.nightbird.modularContext.textBaseline = 'middle';
		it.nightbird.modularContext.fillStyle = '#ddd';
		it.nightbird.modularContext.fillText( '   '+it.name+'   ', it.posX, it.posY );
	};

};
