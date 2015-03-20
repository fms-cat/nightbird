#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform float param0;
uniform sampler2D texture0;

#define r resolution
#define c gl_FragCoord

void comp( vec2 v2, inout vec2 v3, vec2 i )
{
	if( length( v2-i ) < length( v2-v3 ) ){ v3 = i; }
}

float round( float _i )
{
	return floor( _i+.5 );
}

void main()
{
	float wid = max( r.x/pow( 2., ( 11.-param0*10. ) ), 1. );
	float wid3 = round( wid*sqrt( 3. ) );
	vec2 v1 = vec2( c.xy-r/2. - mod( c.xy-r/2., vec2( wid*2., wid3*2. ) ) );

	vec2 v2 = vec2( mod( c.xy-r/2., vec2( wid*2., wid3*2. ) ) );

	vec2 v3 = vec2( 0. );
	comp( v2, v3, vec2( wid*2., 0. ) );
	comp( v2, v3, vec2( wid, wid3/3. ) );
	comp( v2, v3, vec2( wid, wid3 ) );
	comp( v2, v3, vec2( 0., wid3*4./3. ) );
	comp( v2, v3, vec2( wid*2., wid3*4./3. ) );
	comp( v2, v3, vec2( 0., wid3*2. ) );
	comp( v2, v3, vec2( wid*2., wid3*2. ) );
	comp( v2, v3, vec2( 0., wid3*2. ) + vec2( wid, wid3/3. ) );

	vec2 p = vec2( clamp( v1+r/2.+v3, vec2( 1. ), vec2( r-1. ) ) )/r;

	gl_FragColor = texture2D( texture0, vec2( p.x, 1.-p.y ) );
}
