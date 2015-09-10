Nightbird.ShaderNode = function( _nightbird, _ab ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.width = 100;
	it.height = 10+100*it.nightbird.height/it.nightbird.width;

	it.program = it.nightbird.shaderMother.defaultProgram;
	it.framebuffer = it.nightbird.shaderMother.createFramebuffer();

	it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.nightbird.width;
	it.canvas.height = it.nightbird.height;
	it.context = it.canvas.getContext( '2d' );

	it.error = '';

	it.textures = [];
	it.params = [];

	it.loadFrag( _ab );

	var outputCanvas = new Nightbird.Connector( it, true, 'canvas' );
	outputCanvas.setName( 'output' );
	outputCanvas.onTransfer = function(){
		return it.canvas;
	};
	it.outputs.push( outputCanvas );
	it.move();

};

Nightbird.ShaderNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.ShaderNode.prototype.constructor = Nightbird.ShaderNode;

Nightbird.ShaderNode.prototype.prepareTexture = function( _i ){

	var it = this;

	it.textures[ _i ] = it.nightbird.shaderMother.createTexture();

	var inputTexture = new Nightbird.Connector( it, false, 'canvas' );
	inputTexture.setName( 'texture' + _i );
	( function( _i ){
		inputTexture.onTransfer = function( _data ){
			it.nightbird.shaderMother.setTexture( it.textures[ _i ], _data );
		};
	}( _i ) );
	it.inputs.push( inputTexture );
	it.nightbird.shaderMother.setTexture( it.textures[ _i ], Nightbird.black1x1 );

};

Nightbird.ShaderNode.prototype.prepareParam = function( _i ){

	var it = this;

	var inputParam = new Nightbird.Connector( it, false, 'number' );
	inputParam.setName( 'param' + _i );
	(function( _i ){
		inputParam.onTransfer = function( _data ){
			it.params[ _i ] = _data;
		};
	}( _i ));
	it.inputs.push( inputParam );

};

Nightbird.ShaderNode.prototype.loadFrag = function( _ab ){

	var it = this;
	var gl = it.gl;

	var array = new Uint8Array( _ab );
	var code = Nightbird.arrayToString( array );

	it.program = it.nightbird.shaderMother.createProgram( code, function( _str ){
		it.error = _str;
	} );

	if( !it.loaded ){
		for( var i=0; i<4; i++ ){
			var re = new RegExp( "uniform sampler2D texture"+i );
			if( re.test( code ) ){
				it.prepareTexture( i );
			}
		}

		for( var i=0; i<4; i++ ){
			var re = new RegExp( "uniform float param"+i );
			if( re.test( code ) ){
				it.prepareParam( i );
			}
		}

		it.move();
	}

};

Nightbird.ShaderNode.prototype.save = function( _hashed ){

	var it = this;

	var obj = Nightbird.Node.prototype.save.call( it, _hashed );
	obj.kind = 'ShaderNode';
	return obj;

};

Nightbird.ShaderNode.prototype.draw = function(){

	var it = this;
	var ctx = it.nightbird.modularContext;

	if( it.active && !it.error ){
		it.nightbird.shaderMother.draw( it );
	}

	ctx.drawImage( it.canvas, it.posX, it.posY+10, it.width, it.height-10 );
	if( it.error ){
		ctx.fillStyle = '#d27';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText( it.error, it.posX+it.width/2, it.posY+10+(it.height-10)/2 );
	}

	Nightbird.Node.prototype.draw.call( it );

};
