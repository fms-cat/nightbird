var GLCat = function( _gl ){

	this.gl = _gl;
	var it = this;
  var gl = it.gl;

  gl.enable( gl.DEPTH_TEST );
  gl.depthFunc( gl.LEQUAL );
  gl.enable( gl.BLEND );
  gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

  gl.getExtension( 'OES_texture_float' );

};

GLCat.prototype.createProgram = function( _vert, _frag, _onError ){

	var it = this;
	var gl = it.gl;

	var error;
	if( typeof _onError === 'function' ){
		error = _onError;
	}else{
		error = function( _str ){ console.error( _str ); }
	}

	var vert = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( vert, _vert );
	gl.compileShader( vert );
	if( !gl.getShaderParameter( vert, gl.COMPILE_STATUS ) ){
		error( gl.getShaderInfoLog( vert ) );
		return null;
	}

	var frag = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( frag, _frag );
	gl.compileShader( frag );
	if(!gl.getShaderParameter( frag, gl.COMPILE_STATUS ) ){
		error( gl.getShaderInfoLog( frag ) );
		return null;
	}

	var program = gl.createProgram();
	gl.attachShader( program, vert );
	gl.attachShader( program, frag );
	gl.linkProgram( program );
	if( gl.getProgramParameter( program, gl.LINK_STATUS ) ){
    program.locations = {};
		return program;
	}else{
		error( gl.getProgramInfoLog( program ) );
		return null;
	}

};

GLCat.prototype.createVertexbuffer = function( _array ){

	var it = this;
	var gl = it.gl;

  var buffer = gl.createBuffer();

  gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( _array ), gl.STATIC_DRAW );
  gl.bindBuffer( gl.ARRAY_BUFFER, null );

  buffer.length = _array.length;
  return buffer;

};

GLCat.prototype.createIndexbuffer = function( _array ){

	var it = this;
	var gl = it.gl;

  var buffer = gl.createBuffer();

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Int16Array( _array ), gl.STATIC_DRAW );
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

  buffer.length = _array.length;
  return buffer;

};

GLCat.prototype.attribute = function( _program, _name, _buffer, _stride ){

	var it = this;
	var gl = it.gl;

  var location;
  if( _program.locations[ _name ] ){
    location = _program.locations[ _name ];
  }else{
    location = gl.getAttribLocation( _program, _name );
    _program.locations[ _name ] = location;
  }

  gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
  gl.enableVertexAttribArray( location );
  gl.vertexAttribPointer( location, _stride, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, null );

};

GLCat.prototype.getUniformLocation = function( _program, _name ){

	var it = this;
	var gl = it.gl;

  var location;

  if( _program.locations[ _name ] ){
		location = _program.locations[ _name ];
	}else{
		location = gl.getUniformLocation( _program, _name );
		_program.locations[ _name ] = location;
	}

  return location;

};

GLCat.prototype.uniform1f = function( _program, _name, _value ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _program, _name );
	gl.uniform1f( location, _value );

};

GLCat.prototype.uniform2fv = function( _program, _name, _value ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _program, _name );
	gl.uniform2fv( location, _value );

};

GLCat.prototype.uniform3fv = function( _program, _name, _value ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _program, _name );
	gl.uniform3fv( location, _value );

};

GLCat.prototype.uniformCubemap = function( _program, _name, _texture, _number ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _program, _name );
  gl.activeTexture( gl.TEXTURE0 + _number );
  gl.bindTexture( gl.TEXTURE_CUBE_MAP, _texture );
  gl.uniform1i( location, _number );

};

GLCat.prototype.uniformTexture = function( _program, _name, _texture, _number ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _program, _name );
  gl.activeTexture( gl.TEXTURE0 + _number );
  gl.bindTexture( gl.TEXTURE_2D, _texture );
  gl.uniform1i( location, _number );

};

GLCat.prototype.createTexture = function(){

	var it = this;
	var gl = it.gl;

	var texture = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
	gl.bindTexture( gl.TEXTURE_2D, null );

	return texture;

};

GLCat.prototype.setTexture = function( _texture, _image ){

	var it = this;
	var gl = it.gl;

	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _image );
	gl.bindTexture( gl.TEXTURE_2D, null );

};

GLCat.prototype.setTextureFromArray = function( _texture, _width, _height, _array ){

	var it = this;
	var gl = it.gl;

	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array( _array ) );
	gl.bindTexture( gl.TEXTURE_2D, null );

};

GLCat.prototype.setTextureFromFloatArray = function( _texture, _width, _height, _array ){

	var it = this;
	var gl = it.gl;

	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, new Float32Array( _array ) );
	gl.bindTexture( gl.TEXTURE_2D, null );

};

GLCat.prototype.createCubemap = function( _arrayOfImage ){

	var it = this;
	var gl = it.gl;

	// order : X+, X-, Y+, Y-, Z+, Z-
	var texture = gl.createTexture();

	gl.bindTexture( gl.TEXTURE_CUBE_MAP, texture );
	for( var i=0; i<6; i++ ){
		gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _arrayOfImage[ i ] );
	}
	gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
	gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );

	return texture;

};

GLCat.prototype.createFramebuffer = function( _width, _height ){

	var it = this;
	var gl = it.gl;

  var framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );

  framebuffer.texture = gl.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, framebuffer.texture );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
  gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0 );

  gl.bindTexture( gl.TEXTURE_2D, null );
  gl.bindFramebuffer( gl.FRAMEBUFFER, null );

  return framebuffer;

};

GLCat.prototype.clear = function(){

	var it = this;
	var gl = it.gl;

  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
  gl.clearDepth( 1.0 );
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

};
