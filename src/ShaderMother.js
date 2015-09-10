Nightbird.ShaderMother = function( _nightbird ){

  var it = this;

  it.nightbird = _nightbird;

  it.canvas = document.createElement( 'canvas' );
  it.canvas.width = it.nightbird.width;
  it.canvas.height = it.nightbird.height;
  it.gl = it.canvas.getContext( 'webgl' );
  it.glCat = new GLCat( it.gl );
  it.quadVBO = it.glCat.createVertexbuffer( [1,-1,1,1,-1,-1,-1,1] );

  it.vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  it.defaultFrag = 'precision mediump float;\nuniform float time;uniform vec2 resolution;uniform sampler2D texture0;void main(){gl_FragColor=texture2D(texture0, vec2( gl_FragCoord.x/resolution.x, 1.-gl_FragCoord.y/resolution.y ) );}';
  it.defaultProgram = it.glCat.createProgram( it.vert, it.defaultFrag );

};

Nightbird.ShaderMother.prototype.createProgram = function( _frag, _onError ){

  var it = this;

  return it.glCat.createProgram( it.vert, _frag, _onError );

};

Nightbird.ShaderMother.prototype.createFramebuffer = function(){

  var it = this;

  return it.glCat.createFramebuffer( it.nightbird.width, it.nightbird.height );

};

Nightbird.ShaderMother.prototype.createTexture = function(){

  var it = this;

  return it.glCat.createTexture();

};

Nightbird.ShaderMother.prototype.setTexture = function( _texture, _image ){

  var it = this;

  return it.glCat.setTexture( _texture, _image );

};

Nightbird.ShaderMother.prototype.draw = function( _node ){

  var it = this;
  var gl = it.gl;
  var glCat = it.glCat;

  var program = _node.program;

  gl.useProgram( program );

  glCat.clear();

  glCat.attribute( program, 'p', it.quadVBO, 2 );

  glCat.uniform1f( program, 'time', it.nightbird.time );
  glCat.uniform2fv( program, 'resolution', [ it.nightbird.width, it.nightbird.height ] );

  for( var i=0; i<4; i++ ){
    if( typeof _node.params[i] === 'number' ){
      glCat.uniform1f( program, 'param'+i, _node.params[i] );
    }
  }

  for( var i=0; i<4; i++ ){
    if( _node.textures[i] ){
      glCat.uniformTexture( program, 'texture'+i, _node.textures[i], i );
    }
  }

  gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
  gl.flush();

  _node.context.drawImage( it.canvas, 0, 0 );

};
