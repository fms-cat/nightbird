#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform sampler2D texture0;
uniform float param0;

#define PI 3.1415926

#define r resolution
#define c gl_FragCoord.xy
#define v vec2(0.,1.)

vec3 barrel( float _amp, vec2 _uv )
{
	vec2 uv = _uv;
	float corn = length( v.yy*.5 );
	float amp = min( _amp*3., PI*corn );
	float zoom = corn/(tan(corn*amp)+corn);
	vec2 p = clamp( (uv+normalize(uv-.5)*tan(length(uv-.5)*amp))*zoom + .5*(1.-zoom), 0., 1. );
	return texture2D( texture0, vec2( p.x, 1.-p.y ) ).xyz;
}

void main()
{
	vec2 uv = c/r;
	vec3 col = v.xxx;
	float amp = clamp( param0, 0., 1. );
	col.x += barrel( amp, uv ).x*.4;
	col.x += barrel( amp*1.005, uv ).x*.4;
	col.x += barrel( amp*1.01, uv ).x*.4;
	col.y += barrel( amp*1.03, uv ).y*.4;
	col.y += barrel( amp*1.035, uv ).y*.4;
	col.y += barrel( amp*1.04, uv ).y*.4;
	col.z += barrel( amp*1.06, uv ).z*.4;
	col.z += barrel( amp*1.065, uv ).z*.4;
	col.z += barrel( amp*1.07, uv ).z*.4;
	gl_FragColor = vec4( col, 1. );
}
