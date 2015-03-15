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
  float p = mod( param0, 1. );
  vec4 tex = vec4( 0. );
  if( p < .25 )
  {
    tex = texture2D( texture0, vec2( uv.x, 1.-uv.y ) );
  }
  else if( p < .5 )
  {
    tex = texture2D( texture1, vec2( uv.x, 1.-uv.y ) );
  }
  else if( p < .75 )
  {
    tex = texture2D( texture2, vec2( uv.x, 1.-uv.y ) );
  }
  else
  {
    tex = texture2D( texture3, vec2( uv.x, 1.-uv.y ) );
  }
  gl_FragColor = tex;
}
