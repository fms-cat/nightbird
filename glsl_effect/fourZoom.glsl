#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform float param0;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;

#define t time
#define r resolution
#define c gl_FragCoord.xy

void main()
{
  vec2 uv = c/r;
  float pp = fract( floor( param0*4. )/4. );
  float pc = fract( param0*4. );
  float zoom = exp( -pc*4. )*.3;
  vec4 col = vec4( 0. );
  vec2 pix = vec2( uv.x*(1.-zoom)+.5*zoom, (1.-uv.y)*(1.-zoom)+.5*zoom );

  if( pp < .25 )
  {
    col = texture2D( texture0, pix );
  }
  else if( pp < .5 )
  {
    col = texture2D( texture1, pix );
  }
  else if( pp < .75 )
  {
    col = texture2D( texture2, pix );
  }
  else
  {
    col = texture2D( texture3, pix );
  }

  gl_FragColor = col;
}
