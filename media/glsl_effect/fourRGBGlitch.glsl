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
#define v vec3( 0., 1., -1. )

float hash( vec3 _i )
{
  return fract( sin( ( _i+sin(t*43.42) )*913.7445 )*429.8318 );
}

void main()
{
  vec2 uv = c/r;
  float pp = fract( floor( param0*4. )/4. );
  float pc = fract( param0*4. )*7.;
  vec3 col = v.xxx;

  vec3 amp = exp( -pc );

  if( uv.x+pix.x < 1. ){ col.x = texture2D( texture0, vec2( uv+v.yx*pix.x ) ).x; }
  else{ col.x = texture2D( texture1, uv+v.yx*pix.x-1. ).x; }
  if( uv.x+pix.y < 1. ){ col.y = texture2D( texture0, uv+v.yx*pix.y ).y; }
  else{ col.y = texture2D( texture1, uv+v.yx*pix.y-1. ).y; }
  if( uv.x+pix.z < 1. ){ col.z = texture2D( texture0, uv+v.yx*pix.z ).z; }
  else{ col.z = texture2D( texture1, uv+v.yx*pix.z-1. ).z; }

  gl_FragColor = vec4( col, 1. );
}
