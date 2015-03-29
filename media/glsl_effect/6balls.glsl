#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform float time;
uniform float param0;
uniform sampler2D texture0;

#define t time
#define r resolution
#define c gl_FragCoord.xy
#define v vec2( 0., 1. )

float f( vec3 p )
{
  float tt = t;
  p.xy = p.xy*mat2( cos(t), -sin(t), sin(t), cos(t) );
  tt = sin( t );
  p.zx = p.zx*mat2( cos(tt), -sin(tt), sin(tt), cos(tt) );
  tt = 2.*time;
  p.yz = p.yz*mat2( cos(tt), -sin(tt), sin(tt), cos(tt) );
  float r = .1+param0*.4;
  float k = .3+param0*.1;
  float d = length( p+v.yxx*k )-r;
  d = min( d, length( p-v.yxx*k )-r);
  d = min( d, length( p+v.xyx*k )-r);
  d = min( d, length( p-v.xyx*k )-r);
  d = min( d, length( p+v.xxy*k )-r);
  d = min( d, length( p-v.xxy*k )-r);
  return d;
}

vec3 n( vec3 p )
{
	vec2 d = v*.01;
	return normalize( vec3( f( p+d.yxx )-f( p-d.yxx ), f( p+d.xyx )-f( p-d.xyx ), f( p+d.xxy )-f( p-d.xxy ) ) );
}

void main()
{
  vec2 uv = c/r;
	vec2 p = (c*2.-r)/r.x;
  vec3 ray = normalize( vec3( p.x, p.y, -1. ) );

  float minL = 1E-3;
  float maxL = 1E4;
  float rL = 0.;
  float rD = minL*2.;
  vec3 rP = v.xxy;
  for( int i=0; i<16; i++ )
  {
    if( abs(rD)<minL || maxL<rL )break;
    rD = f( rP );
    rL += rD;
    rP = v.xxy+ray*rL;
  }

  vec4 col = v.xxxx;
  if( rD < 1E-2 )
  {
    vec2 texp = vec2( .5+n(rP).xy/r*min( r.x, r.y )*.5 );
    col.xyz = texture2D( texture0, vec2( texp.x, 1.-texp.y ) ).xyz * ( .1/rL*n(rP).z+.9 );
    col.w = 1.;
  }
  gl_FragColor = col;
}
