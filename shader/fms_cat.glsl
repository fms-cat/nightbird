#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define t time
#define r resolution
#define c (gl_FragCoord.xy)

void main()
{
	vec2 uv = (2.*c-r)/r.y;
	float p = length(floor(uv*12.+.5));
	gl_FragColor = vec4(
		.5+.5*sin(p-t*12.),
		.5+.5*sin(p-t*12.+2.),
		.5+.5*sin(p-t*12.+4.),
		1.
	);
}
