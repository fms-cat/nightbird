// interleaved dithering function
// http://radiumsoftware.tumblr.com/post/112856931584
// by nikq.

//Testing dithing a palette of colors

#ifdef GL_ES
precision mediump float;
#endif

#define RGB(r,g,b) (vec3(r,g,b)/255.0);

//#define INTERP_NEAREST
//#define INTERP_LINEAR
#define INTERP_SMOOTH

uniform float time;
uniform vec2 resolution;

vec3 palette[16];

//vec3 palette2[

float dither( vec2 sv_position, float scale ){
  vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
  return - scale + 2.0 * scale * fract( magic.z * fract( dot( sv_position, magic.xy ) ) );
}

//16-Color C64 color palette
void InitPalette()
{
	palette[ 0] = RGB(  0,  0,  0);
	palette[ 1] = RGB(255,255,255);
	palette[ 2] = RGB(152, 75, 67);
	palette[ 3] = RGB(121,193,200);

	palette[ 4] = RGB(155, 81,165);
	palette[ 5] = RGB(104,174, 92);
	palette[ 6] = RGB( 82, 66,157);
	palette[ 7] = RGB(201,214,132);

	palette[ 8] = RGB(155,103, 57);
	palette[ 9] = RGB(106, 84,  0);
	palette[10] = RGB(195,123,117);
	palette[11] = RGB( 99, 99, 99);

	palette[12] = RGB(138,138,138);
	palette[13] = RGB(163,229,153);
	palette[14] = RGB(138,123,206);
	palette[15] = RGB(173,173,173);
}

vec3 GetDitheredPalette(float x)
{
	float idx = clamp(x,0.0,1.0)*15.0;

	vec3 c1 = vec3(0);
	vec3 c2 = vec3(0);

	for(int i = 0;i < 16;i++)
	{
		if(float(i) == floor(idx))
		{
			c1 = palette[i];
			c2 = palette[i+1];
			break;
		}
	}
	float interp = 0.0;
	#ifdef INTERP_NEAREST
	interp = step(0.5,idx);
	#endif
	#ifdef INTERP_LINEAR
	interp = fract(idx);
	#endif
	#ifdef INTERP_SMOOTH
	interp = smoothstep(0.0,1.0,fract(idx));
	#endif

	float dith = dither( gl_FragCoord.xy,1.0 )*0.5+0.5;

	return mix(c1,c2,float(interp > dith));
}

float map(float x0,float x1,float y0,float y1, float x)
{
	return mix(y0,y1,(x-x0) / (x1-x0));
}

void main( void )
{
	InitPalette();

	vec2 res = resolution / resolution.y;
	vec2 uv = (gl_FragCoord.xy / resolution.y) - res/2.0;

	uv.x -= 0.5*sin(uv.y * 4.0 +time);
	float color = sin(uv.x*4.0 + sin(uv.y*3.0+time + sin(uv.x * 6.0 - time)))*sin(uv.y*4.0 + sin(uv.x*3.0+time));

	color = color*0.5+0.5;

	//color =  map(0.0,1.0,0.4,0.6,color);

	gl_FragColor = vec4(GetDitheredPalette(color),1.0);
}
