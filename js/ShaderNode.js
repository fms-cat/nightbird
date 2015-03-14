Nightbird.vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
Nightbird.frag = '#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform float time;uniform vec2 resolution;uniform sampler2D texture;void main(){gl_FragColor=texture2D(texture, vec2( gl_FragCoord.x/resolution.x, 1.-gl_FragCoord.y/resolution.y ) );}';

Nightbird.ShaderNode = function( _nightbird, _file ){

	var shaderNode = this;

	Nightbird.Node.call( shaderNode, _nightbird );
	shaderNode.name = _file.name;

	shaderNode.canvas = document.createElement( 'canvas' );
	shaderNode.canvas.width = 512;
	shaderNode.canvas.height = 512;

	shaderNode.gl = shaderNode.canvas.getContext( 'webgl' );
	var gl = shaderNode.gl;

	shaderNode.setProgram( Nightbird.frag );

	shaderNode.vbo = (function(){
		var vbo = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, vbo );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [-1,1,-1,-1,1,1,1,-1] ), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );

		return vbo;
	}());
	gl.bindBuffer( gl.ARRAY_BUFFER, shaderNode.vbo );

	var loc = gl.getAttribLocation( shaderNode.program, 'p' );
	gl.enableVertexAttribArray( loc );
	gl.vertexAttribPointer( loc, 2, gl.FLOAT, false, 0, 0 );

	shaderNode.loadGlsl( _file );

	shaderNode.parameter = 0;

	var outputCanvas = new Nightbird.Connector( shaderNode.nightbird, true, 'canvas' );
	outputCanvas.setName( 'canvas' );
	outputCanvas.transferData = shaderNode.canvas;
	shaderNode.outputs.push( outputCanvas );

	shaderNode.texture = [];
	shaderNode.param = [];
	shaderNode.move();

};

Nightbird.ShaderNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.ShaderNode.prototype.constructor = Nightbird.ShaderNode;

Nightbird.ShaderNode.prototype.setProgram = function( _frag, _name ){

	var shaderNode = this;
	var gl = shaderNode.gl;

	var v = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( v, Nightbird.vert );
	gl.compileShader( v );
	if( !gl.getShaderParameter( v, gl.COMPILE_STATUS ) ){ console.error( gl.getShaderInfoLog( v ) ); return; }

	var f = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( f , _frag );
	gl.compileShader( f );
	if( !gl.getShaderParameter( f, gl.COMPILE_STATUS ) ){ console.error( gl.getShaderInfoLog( f ) ); return; }

	var p = gl.createProgram();
	gl.attachShader( p, v );
	gl.attachShader( p, f );
	gl.linkProgram( p );
	if( gl.getProgramParameter( p, gl.LINK_STATUS ) ){
		shaderNode.program = p;
	}else{
		alert( gl.getProgramInfoLog( p ) );
	}

};

Nightbird.ShaderNode.prototype.setTime = function( _t ){

	var shaderNode = this;

	if( isNaN( _t ) ){ _t = 0; }
	shaderNode.begint = +new Date() - _t*1000;

};

Nightbird.ShaderNode.prototype.loadGlsl = function( _file ){

	var shaderNode = this;
	var gl = shaderNode.gl;

	var reader = new FileReader();
	reader.onload = function(){

		shaderNode.setProgram( reader.result, name );

		for( var i=0; i<4; i++ ){
			var re = new RegExp( "uniform sampler2D texture"+i );
			if( re.test( reader.result ) ){
				gl.activeTexture( 33984+i ); // gl.TEXTURE0 = 33984
				shaderNode.texture[i] = gl.createTexture();
				gl.bindTexture( gl.TEXTURE_2D, shaderNode.texture[i] );
			  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
			  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
				gl.bindTexture( gl.TEXTURE_2D, null );

				var inputTexture = new Nightbird.Connector( shaderNode.nightbird, false, 'canvas' );
				inputTexture.setName( 'texture'+i );
				(function( _i ){
					inputTexture.onTransfer = function( _data ){
						shaderNode.setTexture( _i, _data );
					};
				}( i ));
				shaderNode.inputs.push( inputTexture );
			}
		}

		for( var i=0; i<4; i++ ){
			var re = new RegExp( "uniform float param"+i );
			if( re.test( reader.result ) ){
				var inputParam = new Nightbird.Connector( shaderNode.nightbird, false, 'number' );
				inputParam.setName( 'param'+i );
				(function( _i ){
					inputParam.onTransfer = function( _data ){
						shaderNode.setParam( _i, _data );
					};
				}( i ));
				shaderNode.inputs.push( inputParam );
			}
		}

		shaderNode.move();

	};
	reader.readAsText( _file );

};

Nightbird.ShaderNode.prototype.setSize = function( _w, _h ){

	var shaderNode = this;

	Node.prototype.setSize.call( shaderNode, _hightbird, _file );

	shaderNode.gl.viewport( 0, 0, _w, _h );

};

Nightbird.ShaderNode.prototype.setTexture = function( _i, _img ){

	var shaderNode = this;
	var gl = shaderNode.gl;

	gl.bindTexture( gl.TEXTURE_2D, shaderNode.texture[_i] );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _img );
  gl.bindTexture( gl.TEXTURE_2D, null );

};

Nightbird.ShaderNode.prototype.setParam = function( _i, _param ){

	var shaderNode = this;

	shaderNode.param[_i] = _param;

};

Nightbird.ShaderNode.prototype.draw = function(){

	var shaderNode = this;
	var gl = shaderNode.gl;

	gl.clearColor( 0, 0, 0, 1 );
  gl.clearDepth( 1 );
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	gl.useProgram( shaderNode.program );

	gl.uniform1f( gl.getUniformLocation( shaderNode.program, 'time' ), shaderNode.nightbird.time );
	gl.uniform2fv( gl.getUniformLocation( shaderNode.program, 'resolution' ), [ shaderNode.canvas.width, shaderNode.canvas.height ] );
	for( var i=0; i<4; i++ ){
		if( typeof shaderNode.param[i] == 'number' ){
			gl.uniform1f( gl.getUniformLocation( shaderNode.program, 'param'+i ), shaderNode.param[i] );
		}
	}

	for( var i=0; i<4; i++ ){
		if( shaderNode.texture[i] ){
			gl.activeTexture( 33984+i ); // gl.TEXTURE0 = 33984
		  gl.bindTexture( gl.TEXTURE_2D, shaderNode.texture[i] );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
		  gl.uniform1i( gl.getUniformLocation( shaderNode.program, 'texture'+i ), i );
		}
	}

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

  gl.flush();

	shaderNode.nightbird.modularContext.drawImage( shaderNode.canvas, shaderNode.posX, shaderNode.posY, 100, 100 );

	Nightbird.Node.prototype.draw.call( shaderNode );

};
