Nightbird.EzFormulaNode = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = 'EzFormula';
	it.width = 80;
	it.height = 45;

	it.str = 'x';
	it.func = it.interpret( it.str );
	it.param = 0;
	it.output = 0;
	it.error = '';

	var input = new Nightbird.Connector( it.nightbird, false, 'number' );
	input.setName( 'x' );
	input.onTransfer = function( _data ){
		it.param = _data;
	};
	it.inputs.push( input );
	var outputValue = new Nightbird.Connector( it.nightbird, true, 'number' );
	outputValue.setName( 'result' );
	outputValue.onTransfer = function(){
		return Number( it.output );
	};
	it.outputs.push( outputValue );
	it.move();

};

Nightbird.EzFormulaNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.EzFormulaNode.prototype.constructor = Nightbird.EzFormulaNode;

Nightbird.EzFormulaNode.prototype.interpret = function( _str ){

	var it = this;
	var func;

	try{
		eval( '\
			( function(){\
				var window, document, navigator, history, alert, prompt, console;\
				window = document = navigator = history = alert = prompt = console = null;\
				func = function(x){\
					with( Math ){\
						return '+(_str)+';\
					}\
				};\
			}() );\
		' );
	}catch( _e ){
		it.error = _e.message;
		return function(x){
			return 0;
		}
	}

	var result;
	try{
		result = func(0);
	}catch( _e ){
		it.error = _e.message;
		return function(x){
			return 0;
		}
	}
	if( typeof result != 'number' ){
		it.error = 'formula returns '+(typeof result);
		return function(x){
			return 0;
		}
	}
	it.error = '';
	return func;

};

Nightbird.EzFormulaNode.prototype.operateDown = function( _x, _y ){

	var it = this;

	if( Math.abs( 40-_x ) < 30 && Math.abs( 20-_y ) < 6 ){
		if( it.lastClick && it.nightbird.time-it.lastClick < .3 ){
			it.nightbird.textbox = new Nightbird.Textbox( it.nightbird, it.str, function( _value ){
				it.str = _value;
				it.func = it.interpret( _value );
			} );
			it.nightbird.textbox.setSize( 80, 12 );
		}else{
			it.lastClick = it.nightbird.time;
			it.operate = true;
		}
		return true;
	}else{
		return false;
	}

};

Nightbird.EzFormulaNode.prototype.operateUp = function(){

	var it = this;

	it.operate = false;

};

Nightbird.EzFormulaNode.prototype.draw = function(){

	var it = this;

	if( it.active ){
		it.output = it.func( it.param.x, it.param.y, it.param.z, it.param.w );
		if( isNaN( it.output ) ){ it.output = 0; }
	}

	it.nightbird.modularContext.fillStyle = '#333';
	it.nightbird.modularContext.fillRect( it.posX, it.posY, it.width, it.height );
	it.nightbird.modularContext.fillStyle = it.operate ? '#777' : '#555';
	it.nightbird.modularContext.fillRect( it.posX+10, it.posY+14, 60, 12 );
	it.nightbird.modularContext.fillStyle = it.error ? '#d27' : '#ddd';
	it.nightbird.modularContext.textAlign = 'center';
	it.nightbird.modularContext.textBaseline = 'middle';
	it.nightbird.modularContext.fillText( it.str, it.posX+40, it.posY+20 );
	it.nightbird.modularContext.fillText( it.error ? it.error : '= '+it.output.toFixed( 3 ), it.posX+40, it.posY+35 );

	Nightbird.Node.prototype.draw.call( it );

};
