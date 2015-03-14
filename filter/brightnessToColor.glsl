#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture;

#define t time
#define r resolution
#define c gl_FragCoord.xy

float gray(vec3 _i)
{
    return (_i.x+_i.y+_i.z)/3.;
}

void main()
{
    vec2 uv = c/r;
    vec4 tex = texture2D( texture, vec2( uv.x, 1.-uv.y ) );

    float g = gray( tex.xyz )*10.;

    gl_FragColor = vec4( sin( g )*.5+.5, sin( g+2. )*.5+.5, sin( g+4. )*.5+.5, 1. );
}
