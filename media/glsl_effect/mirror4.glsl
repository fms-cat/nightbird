#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform sampler2D texture0;
uniform float param0;

#define r resolution
#define c gl_FragCoord.xy

void main()
{
  vec2 uv = c/r;
  vec2 p = vec2( mod( param0, .5 ), mod( param0, 1. ) );
  if( p.x < .25 && .5 < uv.x ){ uv.x = 1.-uv.x; }
  if( .25 <= p.x && uv.x < .5 ){ uv.x = 1.-uv.x; }
  if( p.y < .5 && .5 < uv.y ){ uv.y = 1.-uv.y; }
  if( .5 <= p.y && uv.y < .5 ){ uv.y = 1.-uv.y; }
  vec3 col = texture2D( texture0, vec2( uv.x, 1.-uv.y ) ).xyz;
  gl_FragColor = vec4( col, 1. );
}
