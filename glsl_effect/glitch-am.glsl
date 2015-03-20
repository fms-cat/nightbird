#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture0;
uniform float param0;

#define r resolution
#define c gl_FragCoord.xy

float noise( float _i )
{
	return fract( sin( _i*3287.5456 )*3982.344 );
}

void main()
{
	vec2 uv = c/r;
	float t = floor( time*.5 );
	float my = c.y;
	float mo = noise( floor( ( my+time )*.07 + noise( floor( my*1.1 ) ) ) );
	vec3 p = vec3(
		fract( uv.x+( .4*sin( mo*182.43+time ) )*param0 ),
		fract( uv.x+( .4*sin( mo*182.43+time+.4 ) )*param0 ),
		fract( uv.x+( .4*sin( mo*182.43+time+.8 ) )*param0 )
	);
	vec3 col = vec3(
		texture2D( texture0, vec2( p.x, 1.-uv.y ) ).x,
		texture2D( texture0, vec2( p.y, 1.-uv.y ) ).y,
		texture2D( texture0, vec2( p.z, 1.-uv.y ) ).z
	);
	gl_FragColor = vec4( col, 1. );
}
