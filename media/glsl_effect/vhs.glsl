#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture0;

vec3 tex2D( sampler2D _tex, vec2 _p )
{
  vec3 col = texture2D( _tex, _p ).xyz + vec3( 0.0, 0.0, 0.01 );
  return normalize( col ) * 0.5 + col;
}

float hash( vec2 _v )
{
  return fract( sin( dot( _v, vec2( 89.44, 19.36 ) ) ) * 22189.22 );
}

float iHash( vec2 _v, vec2 _r )
{
  float h00 = hash( vec2( floor( _v * _r + vec2( 0.0, 0.0 ) ) / _r ) );
  float h10 = hash( vec2( floor( _v * _r + vec2( 1.0, 0.0 ) ) / _r ) );
  float h01 = hash( vec2( floor( _v * _r + vec2( 0.0, 1.0 ) ) / _r ) );
  float h11 = hash( vec2( floor( _v * _r + vec2( 1.0, 1.0 ) ) / _r ) );
  vec2 ip = vec2( smoothstep( vec2( 0.0, 0.0 ), vec2( 1.0, 1.0 ), mod( _v*_r, 1. ) ) );
  return ( h00 * ( 1. - ip.x ) + h10 * ip.x ) * ( 1. - ip.y ) + ( h01 * ( 1. - ip.x ) + h11 * ip.x ) * ip.y;
}

float noise( vec2 _v )
{
  float sum = 0.;
  for( int i=1; i<9; i++ )
  {
      sum += iHash( _v + vec2( i ), vec2( 2. * pow( 2., float( i ) ) ) ) / pow( 2., float( i ) );
  }
  return sum;
}

vec3 hueShift( vec3 _i, float _p )
{
  vec3 p = vec3( 0.0 );
  p.x = clamp( cos( _p ), 0.0, 1.0 );
  p.y = clamp( cos( _p - PI / 3.0 * 2.0 ), 0.0, 1.0 );
  p.z = clamp( cos( _p - PI / 3.0 * 4.0 ), 0.0, 1.0 );
  return vec3(
    dot( _i, p.xyz ),
    dot( _i, p.zxy ),
    dot( _i, p.yzx )
  );
}

void main()
{
  vec2 uv = vec2( -0.01, 1.01 ) + vec2( 1.02, -1.02 ) * gl_FragCoord.xy / resolution;
  vec2 uvn = uv;
  float huen = 0.0;
  vec3 tex = vec3( 0.0 );
  vec3 col = vec3( 0.0 );

  tex = tex2D( texture0, uvn );
  col = tex;

  // tape wave
  uvn.x += ( noise( vec2( uvn.y, time ) ) - 0.5 )* 0.005;
  uvn.x += ( noise( vec2( uvn.y * 100.0, time * 10.0 ) ) - 0.5 ) * 0.001;
  col = tex2D( texture0, uvn );

  // tape crease
  float tcPhase = clamp( ( sin( uvn.y * 8.0 + time * PI * 1.2 ) - 0.92 ) * noise( vec2( time ) ), 0.0, 0.01 ) * 10.0;
  float tcNoise = max( noise( vec2( uvn.y * 100.0, time * 10.0 ) ) - 0.5, 0.0 );
  uvn.x = uvn.x - tcNoise * tcPhase;
  huen += ( tcNoise + 5.0 ) * tcPhase;
  col = hueShift( tex2D( texture0, uvn ), huen );

  // switching noise
  float snPhase = clamp( pow( uv.y, 500.0 ) * 1000.0, 0.0, 1.0 );
  uvn.x = uvn.x * ( 1.0 - snPhase * 0.5 ) + snPhase * ( noise( vec2( uv.y * 100.0, time * 10.0 ) ) * 0.2 + 0.1 );
  huen += snPhase * 1.0;
  col = hueShift( tex2D( texture0, uvn ), huen );

  // ghost
  vec3 ghostTex = tex2D( texture0, uvn - vec2( 0.03, 0.0 ) );
  float ghostNoise = noise( vec2( uv.y * 2.0, - time * 4.0 ) );
  col += ( vec3( ghostTex.x + ghostTex.y + ghostTex.z ) * 0.1 - 0.05 ) * ghostNoise;

  // color noise
  col.x *= 0.8 + 0.2 * noise( vec2( uv.y, time * 4.0 ) );
  col.y *= 0.8 + 0.2 * noise( vec2( uv.y + 1.0, time * 4.0 ) );
  col.z *= 0.8 + 0.2 * noise( vec2( uv.y + 2.0, time * 4.0 ) );

  // ac beat
  col *= 1.0 + clamp( noise( vec2( 0.0, uv.y + time * 0.2 ) ) * 0.6 - 0.25, 0.0, 0.1 );

  // color gradient
  col.x *= 1.0 - 0.2 + 0.2 * uv.x;
  col.y *= 1.0 - 0.2 + 0.2 * ( 1.0 - uv.x );

  gl_FragColor = vec4( col, 1.0 );
}
