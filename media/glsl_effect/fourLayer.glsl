#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;

#define t time
#define r resolution
#define c gl_FragCoord.xy

vec3 blend( vec3 _b, vec4 _l ){
  return _b*(1.-_l.w)+_l.xyz*_l.w;
}

void main()
{
  vec2 uv = c/r;
  vec2 p = vec2( uv.x, 1.-uv.y );
  vec3 col = vec3( 0. );

  col = texture2D( texture3, p ).xyz;
  col = blend( col, texture2D( texture2, p ) );
  col = blend( col, texture2D( texture1, p ) );
  col = blend( col, texture2D( texture0, p ) );

  gl_FragColor = vec4( col, 1. );
}
