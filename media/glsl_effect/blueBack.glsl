#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform float param0;
uniform sampler2D texture0;
uniform sampler2D texture1;

#define t time
#define r resolution
#define c gl_FragCoord.xy
#define cl(i) clamp(i,0.,1.)
#define V vec2(0.,1.)

void main()
{
  vec2 uv = c/r;
  vec3 tex = texture2D( texture0, vec2( uv.x, 1.-uv.y ) ).xyz;
  float blend = cl( ( length( tex - V.xxy ) - param0 ) * 40. );
  tex = tex * blend + texture2D( texture1, vec2( uv.x, 1.-uv.y ) ).xyz * ( 1.-blend );

  gl_FragColor = vec4( tex, 1. );
}
