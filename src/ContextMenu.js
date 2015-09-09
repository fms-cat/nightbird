Nightbird.ContextMenu = function( _nightbird ){

	var it = this;

	it.nightbird = _nightbird;

	it.name = '';

	it.posX = 0;
	it.posY = 0;
	it.width = 100;
	it.height = 14;

};

Nightbird.ContextMenu.prototype.move = function( _x, _y ){

	var it = this;

	it.posX = _x;
	it.posY = _y;

};

Nightbird.ContextMenu.prototype.setName = function( _name ){

	var it = this;

	it.name = _name;

};

Nightbird.ContextMenu.prototype.draw = function(){

	var it = this;

	it.nightbird.modularContext.fillStyle = '#aaa';
	it.nightbird.modularContext.fillRect( it.posX, it.posY, it.width, it.height );
	if( it.nightbird.selectContextMenu === it ){
		it.nightbird.modularContext.fillStyle = '#444';
		it.nightbird.modularContext.fillRect( it.posX+2, it.posY+2, it.width-4, it.height-4 );
		it.nightbird.modularContext.fillStyle = '#aaa';
	}else{
		it.nightbird.modularContext.fillStyle = '#444';
	}
	it.nightbird.modularContext.textAlign = 'left';
	it.nightbird.modularContext.textBaseline = 'middle';
	it.nightbird.modularContext.fillText( it.name, it.posX+4, it.posY+7 );

};
