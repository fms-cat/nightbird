#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture0;
uniform float param0;
uniform float param1;

#define PI 3.1415926

#define r resolution
#define c gl_FragCoord.xy

vec3 hue( float _i )
{
	float i = _i*PI*2.;
	float r = cos( i )*.5+.5;
	float g = cos( i+PI/3.*4. )*.5+.5;
	float b = cos( i+PI/3.*2. )*.5+.5;
	return vec3( r, g, b );
}

void main()
{
	float s = 32.;
	vec3 col;
	vec3 tex = texture2D( texture0, vec2( c.x/r.x, 1.-c.y/r.y ) ).xyz;
	float g = ( tex.x+tex.y+tex.z )/3.;
	float phase = clamp( ( param0*1.2-.1 )*s-mod( c.x-c.y, s ), 0., 1. );
	col = ( 1.-g )*hue( param1 )*phase + tex*( 1.-phase );
	gl_FragColor = vec4( col, 1. );
}
