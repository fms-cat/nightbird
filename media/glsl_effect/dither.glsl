// https://en.wikipedia.org/wiki/Ordered_dithering

precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture0;

float dither( vec2 _coord ){
  float ret = 0.0;
  for( float i=0.0; i<2.5; i+=1.0 ){
    vec2 coord = mod( _coord / pow( 2.0, 2.0 - i ), vec2( 2.0 ) );
    float base = pow( 4.0, i );
    if( coord.x < 1.0 && coord.y < 1.0 ){ ret += 0.0; }
    else if( coord.x < 1.0 && 1.0 < coord.y ){ ret += base * 2.0; }
    else if( 1.0 < coord.x && coord.y < 1.0 ){ ret += base * 3.0; }
    else{ ret += base; }
  }
  return ret / 64.0;
}

void main(){
  vec2 uv = vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * gl_FragCoord.xy / resolution.xy;
  vec3 tex = texture2D( texture0, uv ).xyz;
  tex = floor( tex * 2.0 + dither( gl_FragCoord.xy ) ) / 2.0;
  gl_FragColor = vec4( tex, 1.0 );
}
