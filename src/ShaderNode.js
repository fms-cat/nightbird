Nightbird.vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
Nightbird.frag = '#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform float time;uniform vec2 resolution;uniform sampler2D texture0;void main(){gl_FragColor=texture2D(texture0, vec2( gl_FragCoord.x/resolution.x, 1.-gl_FragCoord.y/resolution.y ) );}';

Nightbird.ShaderNode = function( _nightbird, _file ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = _file.name;
	it.width = 100;
	it.height = 10+100*it.nightbird.height/it.nightbird.width;

	it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.nightbird.width;
	it.canvas.height = it.nightbird.height;

	it.gl = it.canvas.getContext( 'webgl' );
	var gl = it.gl;

	it.setProgram( Nightbird.frag );

	it.vbo = (function(){
		var vbo = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, vbo );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [-1,1,-1,-1,1,1,1,-1] ), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );

		return vbo;
	}());
	gl.bindBuffer( gl.ARRAY_BUFFER, it.vbo );

	var loc = gl.getAttribLocation( it.program, 'p' );
	gl.enableVertexAttribArray( loc );
	gl.vertexAttribPointer( loc, 2, gl.FLOAT, false, 0, 0 );

	it.error = '';

	it.loaded = false;
	it.availTexture = [];
	it.availParam = [];
	for( var i=0; i<4; i++ ){
		it.availTexture[i] = false;
		it.availParam[i] = false;
	}

	it.loadGlsl( _file );

	it.textures = [];
	it.params = [];

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

Nightbird.ShaderNode.prototype.setProgram = function( _frag, _name ){

	var it = this;
	var gl = it.gl;

	var v = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( v, Nightbird.vert );
	gl.compileShader( v );
	if( !gl.getShaderParameter( v, gl.COMPILE_STATUS ) ){
		it.error = gl.getShaderInfoLog( v );
		return;
	}

	var f = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( f , _frag );
	gl.compileShader( f );
	if( !gl.getShaderParameter( f, gl.COMPILE_STATUS ) ){
		it.error = gl.getShaderInfoLog( f );
		return;
	}

	var p = gl.createProgram();
	gl.attachShader( p, v );
	gl.attachShader( p, f );
	gl.linkProgram( p );
	if( gl.getProgramParameter( p, gl.LINK_STATUS ) ){
		it.program = p;
	}else{
		it.error = gl.getProgramInfoLog( p );
	}

};

Nightbird.ShaderNode.prototype.setTime = function( _t ){

	var it = this;

	if( isNaN( _t ) ){ _t = 0; }
	it.begint = +new Date() - _t*1000;

};

Nightbird.ShaderNode.prototype.setConnector

Nightbird.ShaderNode.prototype.loadGlsl = function( _file ){

	var it = this;

	var gl = it.gl;

	var reader = new FileReader();
	reader.onload = function(){

		it.setProgram( reader.result, name );

		if( !it.loaded ){

			for( var i=0; i<4; i++ ){
				var re = new RegExp( "uniform sampler2D texture"+i );
				if( re.test( reader.result ) ){
					gl.activeTexture( 33984+i ); // gl.TEXTURE0 = 33984
					it.textures[i] = gl.createTexture();
					gl.bindTexture( gl.TEXTURE_2D, it.textures[i] );
				  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
				  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
					gl.bindTexture( gl.TEXTURE_2D, null );

					var inputTexture = new Nightbird.Connector( it, false, 'canvas' );
					inputTexture.setName( 'texture'+i );
					( function( _i ){
						inputTexture.onTransfer = function( _data ){
							it.setTexture( _i, _data );
						};
					}( i ) );
					it.inputs.push( inputTexture );
					it.availTexture[i] = true;
					it.setTexture( i, Nightbird.black1x1 );
				}
			}

			for( var i=0; i<4; i++ ){
				var re = new RegExp( "uniform float param"+i );
				if( re.test( reader.result ) ){
					var inputParam = new Nightbird.Connector( it, false, 'number' );
					inputParam.setName( 'param'+i );
					(function( _i ){
						inputParam.onTransfer = function( _data ){
							it.setParam( _i, _data );
						};
					}( i ));
					it.inputs.push( inputParam );
					it.availParam[i] = true;
				}
			}

		}

		it.move();

	};
	reader.readAsText( _file );

};

Nightbird.ShaderNode.prototype.setTexture = function( _i, _img ){

	var it = this;
	var gl = it.gl;

	gl.bindTexture( gl.TEXTURE_2D, it.textures[_i] );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _img );
  gl.bindTexture( gl.TEXTURE_2D, null );

};

Nightbird.ShaderNode.prototype.setParam = function( _i, _param ){

	var it = this;

	it.params[_i] = _param;

};

Nightbird.ShaderNode.prototype.save = function( _hashed ){

	var it = this;

	var obj = Nightbird.Node.prototype.save.call( it, _hashed );
	obj.kind = 'ShaderNode';
	obj.availTexture = it.availTexture;
	obj.availParam = it.availParam;
	return obj;

};

Nightbird.ShaderNode.prototype.load = function( _obj ){

	var it = this;
	
	var gl = it.gl;

	Nightbird.Node.prototype.load.call( it, _obj );

	it.loaded = true;

	for( var i=0; i<4; i++ ){
		if( it.availTexture[i] ){
			gl.activeTexture( 33984+i ); // gl.TEXTURE0 = 33984
			it.textures[i] = gl.createTexture();
			gl.bindTexture( gl.TEXTURE_2D, it.textures[i] );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
			gl.bindTexture( gl.TEXTURE_2D, null );

			var inputTexture = new Nightbird.Connector( it, false, 'canvas' );
			inputTexture.setName( 'texture'+i );
			( function( _i ){
				inputTexture.onTransfer = function( _data ){
					it.setTexture( _i, _data );
				};
			}( i ) );
			it.inputs.push( inputTexture );
			it.setTexture( i, Nightbird.black1x1 );
		}
	}

	for( var i=0; i<4; i++ ){
		if( it.availParam[i] ){
			var inputParam = new Nightbird.Connector( it, false, 'number' );
			inputParam.setName( 'param'+i );
			(function( _i ){
				inputParam.onTransfer = function( _data ){
					it.setParam( _i, _data );
				};
			}( i ));
			it.inputs.push( inputParam );
		}
	}

};

Nightbird.ShaderNode.prototype.draw = function(){

	var it = this;

	if( it.active ){

		var gl = it.gl;

		gl.clearColor( 0, 0, 0, 1 );
	  gl.clearDepth( 1 );
	  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		gl.useProgram( it.program );

		gl.uniform1f( gl.getUniformLocation( it.program, 'time' ), it.nightbird.time );
		gl.uniform2fv( gl.getUniformLocation( it.program, 'resolution' ), [ it.canvas.width, it.canvas.height ] );
		for( var i=0; i<4; i++ ){
			if( typeof it.params[i] === 'number' ){
				gl.uniform1f( gl.getUniformLocation( it.program, 'param'+i ), it.params[i] );
			}
		}

		for( var i=0; i<4; i++ ){
			if( it.textures[i] ){
				gl.activeTexture( 33984+i ); // gl.TEXTURE0 = 33984
			  gl.bindTexture( gl.TEXTURE_2D, it.textures[i] );
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			  gl.uniform1i( gl.getUniformLocation( it.program, 'texture'+i ), i );
			}
		}

		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

	  gl.flush();

	}

	it.nightbird.modularContext.drawImage( it.canvas, it.posX, it.posY+10, it.width, it.height-10 );
	if( it.error ){
		it.nightbird.modularContext.fillStyle = '#d27';
		it.nightbird.modularContext.textAlign = 'center';
		it.nightbird.modularContext.textBaseline = 'middle';
		it.nightbird.modularContext.fillText( it.error, it.posX+it.width/2, it.posY+10+(it.height-10)/2 );
	}

	Nightbird.Node.prototype.draw.call( it );

};
