#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform float param0;
uniform sampler2D texture0;

#define t time
#define r resolution
#define c gl_FragCoord.xy

void main()
{
  vec2 uv = c/r;
  float zoom = param0;
  vec4 col = vec4( 0. );
  vec2 pix = vec2( uv.x*(1.-zoom)+.5*zoom, (1.-uv.y)*(1.-zoom)+.5*zoom );

  col = texture2D( texture0, pix );

  gl_FragColor = col;
}
