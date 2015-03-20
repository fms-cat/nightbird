/*
.set("size",width,height);
.set("time",frameCount);
.set("param",amount);
*/

uniform sampler2D texture;
uniform ivec2 size;
uniform int time;
uniform float param;

void main()
{
	ivec2 rp=ivec2((gl_FragCoord.xy-size/2)/(1+param*0.3)+size/2);
	ivec2 gp=ivec2((gl_FragCoord.xy-size/2)/(1+param*0.6)+size/2);
	ivec2 bp=ivec2((gl_FragCoord.xy-size/2)/(1+param*0.9)+size/2);
	float r=texelFetch(texture,rp,0).r;
	float g=texelFetch(texture,gp,0).g;
	float b=texelFetch(texture,bp,0).b;
	gl_FragColor=vec4(r,g,b,1);
}