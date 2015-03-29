#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform sampler2D texture0;

#define DELTA .01

#define r resolution
#define c gl_FragCoord.xy

void main()
{
  vec2 uv = c/r;
  vec3 l = texture2D( texture0, vec2( uv.x-DELTA, 1.-uv.y ) ).xyz;
  vec3 r = texture2D( texture0, vec2( uv.x+DELTA, 1.-uv.y ) ).xyz;
  vec3 u = texture2D( texture0, vec2( uv.x, 1.-uv.y+DELTA ) ).xyz;
  vec3 d = texture2D( texture0, vec2( uv.x, 1.-uv.y-DELTA ) ).xyz;
  gl_FragColor = vec4( vec3( abs( l-r ) + abs( u-d ) ), 1. );
}
