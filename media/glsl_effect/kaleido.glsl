#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform sampler2D texture0;
uniform float param0;

#define PI 3.1415926

#define r resolution
#define c gl_FragCoord.xy

void main()
{
	float angle = atan( c.y-r.y/2., c.x-r.x/2. );
	angle = mod( angle-PI/6., PI/3.*2. );
	if(PI/3. < angle){ angle = PI/3.*2.-angle; }
	angle += param0*PI*2.;

	float dist = length( c-r/2. );
	float rmin = min( r.x, r.y );
	dist = mod( dist, rmin );
	if( rmin/2. < dist ){ dist = rmin - dist; }

	gl_FragColor = texture2D( texture0, vec2( r.x/2.+cos(angle)*dist, r.y/2.+sin(angle)*dist )/r );
}
