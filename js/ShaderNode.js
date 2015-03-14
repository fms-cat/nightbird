Nightbird.vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
Nightbird.frag = '#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform float time;uniform vec2 resolution;uniform sampler2D texture;void main(){gl_FragColor=texture2D(texture, vec2( gl_FragCoord.x/resolution.x, 1.-gl_FragCoord.y/resolution.y ) );}';

Nightbird.ShaderNode = function( _nightbird, _file ){

	var shaderNode = this;

	Nightbird.Node.call( shaderNode, _nightbird );

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

	gl.activeTexture( gl.TEXTURE0 );
	shaderNode.texture = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, shaderNode.texture );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
	gl.bindTexture( gl.TEXTURE_2D, null );

	shaderNode.loadGlsl( _file );

	shaderNode.parameter = 0;

	var outputCanvas = new Nightbird.Connector( nightbird, true, 'canvas' );
	outputCanvas.setName( 'canvas' );
	outputCanvas.transferData = shaderNode.canvas;
	shaderNode.outputs.push( outputCanvas );
	var inputCanvas = new Nightbird.Connector( nightbird, false, 'canvas' );
	inputCanvas.setName( 'canvas' );
	inputCanvas.onTransfer = function( _data ){
		shaderNode.setTexture( _data );
	};
	shaderNode.inputs.push( inputCanvas );
	var inputParam = new Nightbird.Connector( nightbird, false, 'number' );
	inputParam.setName( 'param' );
	inputParam.onTransfer = function( _data ){
		shaderNode.setParameter( _data );
	};
	shaderNode.inputs.push( inputParam );
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

	var reader = new FileReader();
	reader.onload = function(){
		shaderNode.setProgram( reader.result, name );
	};
	reader.readAsText( _file );

};

Nightbird.ShaderNode.prototype.setSize = function( _w, _h ){

	var shaderNode = this;

	Node.prototype.setSize.call( shaderNode, _hightbird, _file );

	shaderNode.gl.viewport( 0, 0, _w, _h );

};

Nightbird.ShaderNode.prototype.setTexture = function( _img ){

	var shaderNode = this;
	var gl = shaderNode.gl;

	gl.bindTexture( gl.TEXTURE_2D, shaderNode.texture );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _img );
  gl.bindTexture( gl.TEXTURE_2D, null );

};

Nightbird.ShaderNode.prototype.setParameter = function( _param ){

	var shaderNode = this;

	shaderNode.parameter = _param;

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
	gl.uniform1f( gl.getUniformLocation( shaderNode.program, 'parameter' ), shaderNode.parameter );

	gl.activeTexture( gl.TEXTURE0 );
  gl.bindTexture( gl.TEXTURE_2D, shaderNode.texture );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  gl.uniform1i( gl.getUniformLocation( shaderNode.program, 'texture' ), 0 );

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

  gl.flush();

	var w = shaderNode.width;
	var h = shaderNode.height;
	shaderNode.nightbird.modularContext.drawImage( shaderNode.canvas, shaderNode.posX, shaderNode.posY, w, h );

	Nightbird.Node.prototype.draw.call( shaderNode );

};
