#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define t time
#define r resolution
#define c gl_FragCoord.xy

void main()
{
	vec2 guv = (c*2.-r)/r.y*.5;
	vec2 uv = (c*2.-r)/r.y*.5;

	float m = 0.;
	for( int i=0; i<11; i++ ){
	  uv = abs( uv );
    m = uv.x*uv.x+uv.y*uv.y;
    uv = uv/m + vec2( -.6-sin(t*.21)*.2, -.5-sin(t*.31)*.1 );
    float th = t*.37 - uv.y*.2;
    uv = mat2( cos(th), -sin(th), sin(th), cos(th) )*uv;
    uv /= abs(uv.x)/pow( abs(uv.y), .2 ) + 2.;
	}

  float mm = exp(-m*3.)*.6+5.;
	vec3 col = vec3( sin(mm*6.+t)*.4, sin(mm*6.+1.), sin(mm*6.+t*.73)*.5 )*.5+.5;
  gl_FragColor = vec4( col-length(guv*.5), 1. );
}
