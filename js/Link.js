Nightbird.Link = function( _nightbird, _connector ){

	var link = this;

	link.nightbird = _nightbird;

	link.grabStart = false;
	link.grabEnd = false;
	link.grabX = 0;
	link.grabY = 0;
	link.start = null;
	link.end = null;
	if( _connector.isOutput ){
		link.start = _connector;
		link.grabX = _connector.posX;
		link.grabY = _connector.posY;
		link.grabEnd = true;
	}else{
		link.end = _connector;
		link.grabX = _connector.posX;
		link.grabY = _connector.posY;
		link.grabStart = true;
	}
	link.type = _connector.type;

};

Nightbird.Link.prototype.move = function( _x, _y ){

	var link = this;

	link.grabX = _x;
	link.grabY = _y;

};

Nightbird.Link.prototype.remove = function(){

	var link = this;

	if( link.start ){
		link.start.removeLink();
	}
	if( link.end ){
		link.end.removeLink();
		link.end.onTransfer( null );
	}

};

Nightbird.Link.prototype.transfer = function(){

	var link = this;

	link.end.onTransfer( link.start.transferData );

};

Nightbird.Link.prototype.draw = function(){

	var link = this;

	if( link.start && link.end ){
		link.transfer();
	}

	var sx = link.grabStart ? link.grabX : link.start.posX;
	var sy = link.grabStart ? link.grabY : link.start.posY;
	var ex = link.grabEnd ? link.grabX : link.end.posX;
	var ey = link.grabEnd ? link.grabY : link.end.posY;
	link.nightbird.modularContext.beginPath();
	link.nightbird.modularContext.moveTo( sx, sy );
	if( sx<ex ){
		link.nightbird.modularContext.bezierCurveTo( sx+(ex-sx)*.3, sy, ex-(ex-sx)*.3, ey, ex, ey );
	}else{
		link.nightbird.modularContext.bezierCurveTo( sx, sy+(ey-sy)*.3, ex, ey-(ey-sy)*.3, ex, ey );
	}
	link.nightbird.modularContext.lineWidth = 2;
	var col;
	switch( link.type ){
		case 'canvas' : col = '#06f'; break;
		case 'number' : col = '#f06'; break;
	}
	if( link.grabStart || link.grabEnd ){
		link.nightbird.modularContext.globalAlpha = .6;
	}
	link.nightbird.modularContext.strokeStyle = col;
	link.nightbird.modularContext.stroke();
	link.nightbird.modularContext.globalAlpha = 1;

};
