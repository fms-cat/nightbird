#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265
#define SAMPLES 40.0

uniform vec2 resolution;
uniform float param0;
uniform sampler2D texture0;

float gaussian( float _x, float _v )
{
  // Ref : https://www.google.co.jp/search?q=wikipedia+gaussian&oq=wikipedia+gau&aqs=chrome.1.69i57j0l5&sourceid=chrome&es_sm=91&ie=UTF-8
  return 1.0 / sqrt( 2.0 * PI * _v ) * exp( - _x * _x / 2.0 / _v );
}

void main()
{
  vec3 col = vec3( 0.0 );
  for( float i=-SAMPLES; i<=SAMPLES; i+=1.0 ){
    texCoord = ( gl_FragCoord.xy + vec2( i, 0.0 ) ) / resolution;
    multiplier = gaussian( i, exp( param0 ) );
    col += texture2D( texture0, texCoord ).xyz * multiplier;
  }
	gl_FragColor = vec4( col, 1.0 );
}
