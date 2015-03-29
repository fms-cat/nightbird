#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture0;

#define PI 3.1415926

#define t time
#define r resolution
#define c gl_FragCoord.xy
#define v vec2(0.,1.)

void main()
{
  vec2 uv = c/r;
  vec2 uvn = ( c*2.-r )/r.x;

  float th = mod( sin( t*.73 )*4. + uvn.y*sin( t*1.48 )*4., PI/2. );
  float v1 = sin( th-PI/4.*3. )*.5;
  float v2 = sin( th-PI/4. )*.5;
  float v3 = sin( th+PI/4. )*.5;

  vec4 col = v.xxxx;
  if( v1 < uvn.x && uvn.x < v2 ){ col.xyz = texture2D( texture0, vec2( .25+.5*(uvn.x-v1)/(v2-v1), 1.-uv.y ) ).xyz; col.w = 1.; }
  if( v2 < uvn.x && uvn.x < v3 ){ col.xyz = texture2D( texture0, vec2( .25+.5*(uvn.x-v2)/(v3-v2), 1.-uv.y ) ).xyz; col.w = 1.; }

  gl_FragColor = col;
}
