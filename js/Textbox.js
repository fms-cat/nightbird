Nightbird.Textbox = function( _nightbird, _default, _onEnter ){

	var textbox = this;

	textbox.nightbird = _nightbird;
	textbox.onEnter = _onEnter;

	textbox.posX = 0;
	textbox.posY = 0;
	textbox.width = 80;
	textbox.height = 16;

	textbox.input = document.createElement( 'input' );
	textbox.input.value = _default;
	textbox.input.type = 'text';
	textbox.input.style.position = 'absolute';
	textbox.input.style.left = textbox.posX+'px';
	textbox.input.style.top = textbox.posY+'px';
	textbox.input.style.width = textbox.width+'px';
	textbox.input.style.height = textbox.height+'px';
	textbox.input.addEventListener( 'keydown', function( _e ){

		var k = _e.keyCode;

		if( k == 13 ){
			textbox.onEnter( textbox.input.value );
			textbox.remove();
		}

	} );

	document.body.appendChild( textbox.input );
	textbox.input.focus();

};

Nightbird.Textbox.prototype.move = function( _x, _y ){

	var textbox = this;

	textbox.posX = _x;
	textbox.posY = _y;

	textbox.input.style.left = textbox.posX+'px';
	textbox.input.style.top = textbox.posY+'px';

};

Nightbird.Textbox.prototype.resize = function( _w, _h ){

	var textbox = this;

	textbox.width = _w;
	textbox.height = _h;

	textbox.input.style.left = textbox.width+'px';
	textbox.input.style.top = textbox.height+'px';

};

Nightbird.Textbox.prototype.remove = function(){

	var textbox = this;

	document.body.removeChild( textbox.input );
	textbox.nightbird.textbox = null;

};
