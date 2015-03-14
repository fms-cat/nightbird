Nightbird.ContextMenu = function( _nightbird ){

	var contextMenu = this;

	contextMenu.nightbird = _nightbird;

	contextMenu.name = '';

	contextMenu.posX = 0;
	contextMenu.posY = 0;
	contextMenu.width = 100;
	contextMenu.height = 14;

	contextMenu.selected = false;

};

Nightbird.ContextMenu.prototype.move = function( _x, _y ){

	var contextMenu = this;

	contextMenu.posX = _x;
	contextMenu.posY = _y;

};

Nightbird.ContextMenu.prototype.setName = function( _name ){

	var contextMenu = this;

	contextMenu.name = _name;

};

Nightbird.ContextMenu.prototype.draw = function(){

	var contextMenu = this;

	contextMenu.nightbird.modularContext.fillStyle = '#aaa';
	contextMenu.nightbird.modularContext.fillRect( contextMenu.posX, contextMenu.posY, contextMenu.width, contextMenu.height );
	if( contextMenu.selected ){
		contextMenu.nightbird.modularContext.fillStyle = '#444';
		contextMenu.nightbird.modularContext.fillRect( contextMenu.posX+1.5, contextMenu.posY+1.5, contextMenu.width-3, contextMenu.height-3 );
		contextMenu.nightbird.modularContext.fillStyle = '#aaa';
	}else{
		contextMenu.nightbird.modularContext.fillStyle = '#444';
	}
	contextMenu.nightbird.modularContext.textAlign = 'left';
	contextMenu.nightbird.modularContext.textBaseline = 'middle';
	contextMenu.nightbird.modularContext.fillText( contextMenu.name, contextMenu.posX+4, contextMenu.posY+7 );

};
