shaderBoardVert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
shaderBoardFrag = '#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform float time;uniform vec2 resolution;uniform sampler2D texture;void main(){gl_FragColor=texture2D(texture, vec2( gl_FragCoord.x/resolution.x, 1.-gl_FragCoord.y/resolution.y ) );}';

var ShaderBoard = function(){

	this.canvas = document.createElement( 'canvas' );
	this.canvas.width = 512;
	this.canvas.height = 512;

	this.gl = this.canvas.getContext( 'webgl' );

	var gl = this.gl;

	this.programs = {};
	this.createProgram( shaderBoardFrag, 'default' );

	this.program = this.programs.default;

	this.vbo = (function(){
		var vbo = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, vbo );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [-1,1,-1,-1,1,1,1,-1] ), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );

		return vbo;
	}());
	gl.bindBuffer( gl.ARRAY_BUFFER, this.vbo );

	var loc = gl.getAttribLocation( this.program, 'p' );
	gl.enableVertexAttribArray( loc );
	gl.vertexAttribPointer( loc, 2, gl.FLOAT, false, 0, 0 );

	this.begint = +new Date();
	this.parameter = [0,0,0,0];

	gl.activeTexture( gl.TEXTURE0 );
	this.texture = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, this.texture );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
	gl.bindTexture( gl.TEXTURE_2D, null );

	this.framebuffer = gl.createFramebuffer();

};

ShaderBoard.prototype.createProgram = function( _frag, _name ){

	var gl = this.gl;

	var v = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( v, shaderBoardVert );
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
		this.programs[ _name ] = p;
	}else{
		alert( gl.getProgramInfoLog( p ) );
	}

};

ShaderBoard.prototype.setProgram = function( _name ){

	this.program = this.programs[ _name ];

};

ShaderBoard.prototype.setTime = function( _t ){

	if( isNaN( _t ) ){ _t = 0; }
	this.begint = +new Date() - _t*1000;

};

ShaderBoard.prototype.loadGlsl = function( _file, _onLoad ){

	var shaderBoard = this;

	var reader = new FileReader();
	var name = _file.name;
	reader.readAsText( _file );

	reader.onload = function(){

		shaderBoard.createProgram( reader.result, name );
		if( typeof(_onLoad) == 'function' ){ _onLoad( _file ); }

	};

};

ShaderBoard.prototype.setResolution = function( _w, _h ){

	this.canvas.width = _w;
	this.canvas.height = _h;

	var gl = this.gl;
	gl.viewport( 0, 0, _w, _h );

};

ShaderBoard.prototype.setTexture = function( _img ){

	var gl = this.gl;

	gl.bindTexture( gl.TEXTURE_2D, this.texture );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _img );
  gl.bindTexture( gl.TEXTURE_2D, null );

};

ShaderBoard.prototype.setFramebufferTexture = function(){

	gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer );
	gl.bindTexture( gl.TEXTURE_2D, this.texture );

  gl.bindTexture( gl.TEXTURE_2D, this.texture );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, this.canvas.width, this.canvas.width, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
  gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0 );

  gl.bindTexture( gl.TEXTURE_2D, null );
  gl.bindFramebuffer( gl.FRAMEBUFFER, null );

};

ShaderBoard.prototype.draw = function(){

	var gl = this.gl;

	gl.clearColor( 0., 0., 0., 1. );
  gl.clearDepth( 1. );
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	gl.useProgram( this.program );

	gl.uniform1f( gl.getUniformLocation( this.program, 'time' ), ( +new Date() - this.begint)*1E-3 );
	gl.uniform2fv( gl.getUniformLocation( this.program, 'resolution' ), [ this.canvas.width, this.canvas.height ] );
	gl.uniform4fv( gl.getUniformLocation( this.program, 'parameter' ), this.parameter );

	gl.activeTexture( gl.TEXTURE0 );
  gl.bindTexture( gl.TEXTURE_2D, this.texture );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  gl.uniform1i( gl.getUniformLocation( this.program, 'texture' ), 0 );

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

  gl.flush();

};

ShaderBoard.prototype.drawFramebuffer = function(){

	var gl = this.gl;

	gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer );
	this.draw();
	gl.bindFramebuffer( gl.FRAMEBUFFER, null );

};
