Nightbird.Textbox = function( _nightbird, _default, _onEnter ){

	var it = this;

	it.nightbird = _nightbird;
	it.onEnter = _onEnter;

	it.posX = it.nightbird.mouseX;
	it.posY = it.nightbird.mouseY;
	it.width = 80;

	it.input = document.createElement( 'input' );
	it.input.value = _default;
	it.input.type = 'text';
	it.input.style.position = 'absolute';
	it.input.style.border = 'none';
	it.input.style.background = '#aaa';
	it.input.style.color = '#444';
	it.input.style.fontSize = '8px';
	it.input.style.left = it.posX+'px';
	it.input.style.top = it.posY+'px';
	it.input.style.width = it.width+'px';
	it.input.addEventListener( 'keydown', function( _e ){

		var k = _e.keyCode;

		if( k == 13 ){
			it.onEnter( it.input.value );
			it.remove();
		}

	} );

	document.body.appendChild( it.input );
	it.input.focus();
	it.input.select();

};

Nightbird.Textbox.prototype.move = function( _x, _y ){

	var it = this;

	it.posX = _x;
	it.posY = _y;

	it.input.style.left = it.posX+'px';
	it.input.style.top = it.posY+'px';

};

Nightbird.Textbox.prototype.setSize = function( _w, _h ){

	var it = this;

	it.width = _w;
	it.height = _h;

	it.input.style.width = it.width+'px';
	it.input.style.height = it.height+'px';

};

Nightbird.Textbox.prototype.remove = function(){

	var it = this;

	document.body.removeChild( it.input );
	it.nightbird.textbox = null;

};
