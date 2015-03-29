Nightbird.Node = function( _nightbird ){

	var it = this;

	it.nightbird = _nightbird;

	it.active = true;
	it.name = '';
	it.nameColor = '#ddd';

	it.posX = 32;
	it.posY = 32;
	it.width = 100;
	it.height = 10;

	it.inputs = [];
	it.outputs = [];

	it.contextMenus = [];

	it.contextMenus.push( function(){
		var contextMenu = new Nightbird.ContextMenu( it.nightbird );
		contextMenu.setName( (function(){
			if( it.active ){ return 'Deactivate'; }
			else{ return 'Activate'; }
		}() ) );
		contextMenu.onClick = function(){
			it.active = !it.active;
		};
		return contextMenu;
	} );
	it.contextMenus.push( function(){
		var contextMenu = new Nightbird.ContextMenu( it.nightbird );
		contextMenu.setName( 'Disconnect' );
		contextMenu.onClick = function(){
			it.disconnect();
		};
		return contextMenu;
	} );
	it.contextMenus.push( function(){
		var contextMenu = new Nightbird.ContextMenu( it.nightbird );
		contextMenu.setName( 'Remove' );
		contextMenu.onClick = function(){
			it.remove();
		};
		return contextMenu;
	} );

};

Nightbird.Node.prototype.move = function( _x, _y ){

	var it = this;

	if( typeof _x == 'number' && typeof _y == 'number' ){
		it.posX = _x;
		it.posY = _y;
	}

	for( var i in it.inputs ){
		it.inputs[i].move( it.posX-12, it.posY+10+16*i );
	}
	for( var i in it.outputs ){
		it.outputs[i].move( it.posX+it.width+12, it.posY+10+16*i );
	}

};

Nightbird.Node.prototype.save = function(){

	var it = this;

	var obj = {};

	obj.kind = 'Node';
	obj.name = it.name;
	obj.posX = it.posX;
	obj.posY = it.posY;
	obj.active = it.active;

	return obj;

};

Nightbird.Node.prototype.load = function( _obj ){

	var it = this;

	for( var key in _obj ){
		it[key] = _obj[key];
	}
	it.move();

};

Nightbird.Node.prototype.disconnect = function(){

	var it = this;

	for( var i=0; i<it.inputs.length; i++ ){
		var connector = it.inputs[i];
		for( var il=connector.links.length-1; 0<=il; il-- ){
			it.nightbird.links.splice( it.nightbird.links.indexOf( connector.links[il] ), 1 );
			connector.links[il].remove();
		}
	}
	for( var i=0; i<it.outputs.length; i++ ){
		var connector = it.outputs[i];
		for( var il=connector.links.length-1; 0<=il; il-- ){
			it.nightbird.links.splice( it.nightbird.links.indexOf( connector.links[il] ), 1 );
			connector.links[il].remove();
		}
	}

};

Nightbird.Node.prototype.remove = function(){

	var it = this;

	it.disconnect();
	it.nightbird.nodes.splice( it.nightbird.nodes.indexOf( it ), 1 );

};

Nightbird.Node.prototype.draw = function(){

	var it = this;

	if( it.active ){ it.nightbird.modularContext.fillStyle = '#567'; }
	else{ it.nightbird.modularContext.fillStyle = '#755'; }
	it.nightbird.modularContext.fillRect( it.posX, it.posY, it.width, 10 );

	it.nightbird.modularContext.fillStyle = it.nameColor;
	it.nightbird.modularContext.textAlign = 'left';
	it.nightbird.modularContext.textBaseline = 'center';
	if( !it.displayName ){
		it.displayName = '';
		for( var i=0; i<it.name.length; i++ ){
			it.displayName += it.name.charAt( i );
			if( it.width-20 < it.nightbird.modularContext.measureText( it.displayName ).width ){
				it.displayName += '...';
				break;
			}
		}
	}
	it.nightbird.modularContext.fillText( it.displayName, it.posX+3, it.posY+5 );

	for( var i in it.inputs ){
		it.inputs[i].draw();
	}
	for( var i in it.outputs ){
		it.outputs[i].draw();
	}

};

Nightbird.Node.prototype.drawTarget = function(){

	var it = this;

	it.nightbird.modularContext.globalAlpha = .2;
	it.nightbird.modularContext.fillStyle = '#846';
	it.nightbird.modularContext.fillRect( it.posX-5, it.posY-5, it.width+10, it.height+10 );
	it.nightbird.modularContext.strokeStyle = '#eac';
	it.nightbird.modularContext.lineWidth = 1;
	it.nightbird.modularContext.strokeRect( it.posX-5, it.posY-5, it.width+10, it.height+10 );
	it.nightbird.modularContext.globalAlpha = 1;

};
