#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform sampler2D texture0;
uniform float param0;

#define r resolution
#define c gl_FragCoord.xy
#define v vec2( 0., 1. )

void main()
{
	if( param0 <= 0. )
	{
		gl_FragColor = texture2D( texture0, vec2( c.x/r.x, 1.-c.y/r.y ) );
	}
	else
	{
		vec2 amp = pow( 2., floor( param0*10. ) )/r;
		vec2 p = vec2( c/r-.5 - mod( c/r-.5, amp ) )+amp/2.+v.yy*.5;
		gl_FragColor = texture2D( texture0, vec2( clamp( vec2( p.x, 1.-p.y ), v.xx, v.yy ) ) );
	}
}
