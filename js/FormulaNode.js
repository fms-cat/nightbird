Nightbird.FormulaNode = function( _nightbird ){

	var formulaNode = this;

	Nightbird.Node.call( formulaNode, _nightbird );
	formulaNode.name = 'Formula';
	formulaNode.width = 200;
	formulaNode.height = 45;

	formulaNode.str = 'x + y + z + w';
	formulaNode.func = formulaNode.interpret( formulaNode.str );
	formulaNode.param = {};
	formulaNode.param.x = 0;
	formulaNode.param.y = 0;
	formulaNode.param.z = 0;
	formulaNode.param.w = 0;
	formulaNode.output = 0;
	formulaNode.error = false;

	for( var v of ['x','y','z','w'] ){
		var input = new Nightbird.Connector( formulaNode.nightbird, false, 'number' );
		input.setName( v );
		input.onTransfer = ( function( _v ){
			return function( _data ){
				formulaNode.param[ _v ] = _data;
			};
		}( v ) );
		formulaNode.inputs.push( input );
	}
	var outputValue = new Nightbird.Connector( formulaNode.nightbird, true, 'number' );
	outputValue.setName( 'result' );
	outputValue.onTransfer = function(){
		return Number( formulaNode.output );
	};
	formulaNode.outputs.push( outputValue );
	formulaNode.move();

};

Nightbird.FormulaNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.FormulaNode.prototype.constructor = Nightbird.FormulaNode;

Nightbird.FormulaNode.prototype.interpret = function( _str ){

	var formulaNode = this;
	var func;

	try{
		eval( '\
			( function(){\
				var window, document, navigator, history, alert, prompt, console;\
				window = document = navigator = history = alert = prompt = console = null;\
				func = function(x,y,z,w){\
					with( Math ){\
						return '+(_str)+';\
					}\
				};\
			}() );\
		' );
	}catch( _e ){
		formulaNode.error = _e.message;
		return function(x,y,z,w){
			return 0;
		}
	}

	var result;
	try{
		result = func(0,0,0,0);
	}catch( _e ){
		formulaNode.error = _e.message;
		return function(x,y,z,w){
			return 0;
		}
	}
	if( typeof result != 'number' ){
		formulaNode.error = 'formula returns '+(typeof result);
		return function(x,y,z,w){
			return 0;
		}
	}
	formulaNode.error = null;
	return func;

};

Nightbird.FormulaNode.prototype.operateDown = function( _x, _y ){

	var formulaNode = this;

	if( Math.abs( 100-_x ) < 80 && Math.abs( 20-_y ) < 6 ){
		if( formulaNode.lastClick && formulaNode.nightbird.time-formulaNode.lastClick < .3 ){
			formulaNode.nightbird.textbox = new Nightbird.Textbox( formulaNode.nightbird, formulaNode.str, function( _value ){
				formulaNode.str = _value;
				formulaNode.func = formulaNode.interpret( _value );
			} );
			formulaNode.nightbird.textbox.move( formulaNode.posX+_x, formulaNode.posY+_y );
			formulaNode.nightbird.textbox.setSize( 160, 12 );
		}else{
			formulaNode.lastClick = formulaNode.nightbird.time;
			formulaNode.operate = true;
		}
		return true;
	}else{
		return false;
	}

};

Nightbird.FormulaNode.prototype.operateUp = function(){

	var formulaNode = this;

	formulaNode.operate = false;

};

Nightbird.FormulaNode.prototype.draw = function(){

	var formulaNode = this;

	if( formulaNode.active ){
		formulaNode.output = formulaNode.func( formulaNode.param.x, formulaNode.param.y, formulaNode.param.z, formulaNode.param.w );
		if( isNaN( formulaNode.output ) ){ formulaNode.output = 0; }
	}

	formulaNode.nightbird.modularContext.fillStyle = '#333';
	formulaNode.nightbird.modularContext.fillRect( formulaNode.posX, formulaNode.posY, formulaNode.width, formulaNode.height );
	formulaNode.nightbird.modularContext.fillStyle = formulaNode.operate ? '#777' : '#555';
	formulaNode.nightbird.modularContext.fillRect( formulaNode.posX+20, formulaNode.posY+14, 160, 12 );
	formulaNode.nightbird.modularContext.fillStyle = formulaNode.error ? '#d27' : '#ddd';
	formulaNode.nightbird.modularContext.textAlign = 'center';
	formulaNode.nightbird.modularContext.textBaseline = 'middle';
	formulaNode.nightbird.modularContext.fillText( formulaNode.str, formulaNode.posX+100, formulaNode.posY+20 );
	formulaNode.nightbird.modularContext.fillText( formulaNode.error ? formulaNode.error : '= '+formulaNode.output.toFixed( 3 ), formulaNode.posX+100, formulaNode.posY+35 );

	Nightbird.Node.prototype.draw.call( formulaNode );

};
