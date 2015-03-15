// FMS_Cat - This Is My Own Sushi !!
// GLSL Graphics for Tokyo Demo Fest 2015
// 2015/02/22
//
// Greeting:
//   gyabo

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define ITER 72
#define SITER 32

#define dance (t*1.)

#define t time
#define r resolution.xy
#define v vec2(0.,1.)
#define cl(i) clamp(i,0.,1.)
#define PI 3.1415926

float hash(vec2 _v)
{
  return fract(sin(dot(_v,vec2(89.44,19.36)))*229.22);
}

float iHash(vec2 _v,vec2 _r)
{
  float h00 = hash(vec2(floor(_v*_r+v.xx)/_r));
  float h10 = hash(vec2(floor(_v*_r+v.yx)/_r));
  float h01 = hash(vec2(floor(_v*_r+v.xy)/_r));
  float h11 = hash(vec2(floor(_v*_r+v.yy)/_r));
  vec2 ip = vec2(smoothstep(v.xx,v.yy,mod(_v*_r,1.)));
  return (h00*(1.-ip.x)+h10*ip.x)*(1.-ip.y)+(h01*(1.-ip.x)+h11*ip.x)*ip.y;
}

float noise(vec2 _v)
{
  float sum = 0.;
  for(int i=1; i<6; i++)
  {
    sum += iHash(_v+vec2(i),vec2(2.*pow(2.,float(i))))/pow(2.,float(i));
  }
  return sum;
}

float noiseT(vec2 _v)
{
  float sum = 0.;
  for(int i=1; i<6; i++)
  {
    sum += iHash(_v+vec2(i)*t,vec2(2.*pow(2.,float(i))))/pow(2.,float(i));
  }
  return sum;
}

float smin(float d1, float d2, float k){
  float h = exp(-k * d1) + exp(-k * d2);
  return -log(h) / k;
}

vec2 rotate(vec2 i,float th)
{
  return mat2(cos(th),-sin(th),sin(th),cos(th))*i;
}

float sphere(vec3 _p,float _r)
{
  return length(_p)-_r;
}

float box(vec3 p,vec3 b)
{
  vec3 d=abs(p)-b;
  return min(max(d.x,max(d.y,d.z)),0.)+length(max(d,0.));
}

float box(vec3 p,float b){return box(p,vec3(b));}

vec2 geta(vec3 p)
{
  float dis=box(p,vec3(.4,.05,.25));
  dis=min(dis,box(p+vec3(.2,.1,.0),vec3(.05,.05,.2)));
  dis=min(dis,box(p+vec3(-.2,.1,.0),vec3(.05,.05,.2)));
  return vec2(dis,0.);
}

vec2 shari(vec3 p)
{
  float dis = sphere(p,.02);
  float ii = 0.;
  for( int i=0; i<26; i++ )
  {
    ii += 1.;
    vec3 pt=vec3(sin(hash(ii*v.yy)*dance),sin(hash(ii*1.13*v.yy)*dance),sin(hash(ii*1.23*v.yy)*dance));
    dis = smin( dis, sphere( p-pt*vec3(.17,.06,.09),.02 ), 49. );
  }
  return vec2(dis,1.);
}

vec2 neta(vec3 p)
{
  p.y+=pow(length(p.xz),2.);
  p.yz=rotate(p.yz,p.x*10.*sin(dance));
  float dis=box(p,vec3(.22,.02,.11));
  return vec2(dis,2.);
}

#define check if(disC.x<dis.x){dis=disC;}
vec2 distFunc(vec3 p)
{
  vec2 dis=geta(p+v.xyx*.12+abs(sin(dance))*v.xyx*.2);
  vec2 disC=shari(p);check;
  disC=neta(p-v.xyx*.12-abs(sin(dance))*v.xyx*.2);check;
  return dis;
}

vec3 getNormal(vec3 p,float d)
{
  return normalize(vec3(
    distFunc(p+vec3(d,0.,0.)).x-distFunc(p+vec3(-d,0.,0.)).x,
    distFunc(p+vec3(0.,d,0.)).x-distFunc(p+vec3(0.,-d,0.)).x,
    distFunc(p+vec3(0.,0.,d)).x-distFunc(p+vec3(0.,0.,-d)).x
    ));
  }

  float shadow(vec3 _ray,vec3 _lig,float k)
  {
    vec3 ray=normalize(_lig-_ray);
    float maxL=length(_lig-_ray);
    float ret=1.;
    float dist=0.;
    float rayL=0.;
    vec3 rayP=_ray;
    for(int c=0;c<SITER;c++)
    {
      float dist=distFunc(rayP).x;
      if(dist<1E-4){return 0.;}
      rayL+=dist;
      rayP=_ray+ray*rayL;
      ret=min(ret,dist*k/rayL);
      if(maxL<rayL){return ret;}
    }
    return 0.;
  }

  float plasma(vec3 p)
  {
    return cl(sin(length((p-v.yyy*vec3(.4,.2,.7))*200.))*4.6+sin(p.x*30.+t)*3.9+sin((p.x*sin(t)+p.y*cos(t*.7)+p.z*.7)*64.)*6.4+.4);
  }

  vec3 shadeGeta(vec3 rayP,vec3 camP)
  {
    vec3 col=v.xxx;

    vec3 nor=getNormal(rayP,1E-4);

    vec3 lig=v.xyx;
    float dif=cl(dot(normalize(lig-rayP),nor))*.3;
    float spe=pow(cl(dot(normalize(normalize(lig-rayP)+normalize(camP-rayP)),nor)),3E1);
    float sha=shadow(rayP+1E-3*nor,lig,1E1);
    float dec=exp(-length(lig-rayP)*.1);

    vec3 base=vec3(.7,.3,.1)+plasma(rayP)*vec3(.0,.7,.2);
    col+=((dif+1.)*(sha*.5+.5)*dec*base+spe*v.yyy)*v.yyx;

    return col;
  }

  vec3 shadeShari(vec3 rayP,vec3 camP)
  {
    vec3 col=v.xxx;

    vec3 nor=getNormal(rayP,1E-4);

    vec3 lig=v.xyx;
    float dif=cl(dot(normalize(lig-rayP),nor))*.3;
    float spe=pow(cl(dot(normalize(normalize(lig-rayP)+normalize(camP-rayP)),nor))*1.02,9E1);
    float sha=shadow(rayP+1E-3*nor,lig,1E1);
    float dec=exp(-length(lig-rayP)*.1);

    col+=((dif*.2+.8)*(sha*.1+.3)*dec*v.yyy+spe*v.yyy);

    return col;
  }

  vec3 shadeNeta(vec3 rayP,vec3 camP)
  {
    vec3 col=v.xxx;

    vec3 nor=getNormal(rayP,1E-4);

    vec3 lig=v.xyx;
    float dif=cl(dot(normalize(lig-rayP),nor))*.3;
    float spe=pow(cl(dot(normalize(normalize(lig-rayP)+normalize(camP-rayP)),nor)),3E1);
    float sha=shadow(rayP+1E-3*nor,lig,1E1);
    float dec=exp(-length(lig-rayP)*.1);
    col+=((dif+.5)*(sha*.5+.5)*dec*v.yxx+spe*v.yyy);

    return col;
  }

  void main()
  {
    vec2 p=(gl_FragCoord.xy*2.-r)/r.x;

    float camR=1.+sin(dance*2.+1.5)*.2;
    float camT=t*.8;

    vec3 camP=vec3(cos(camT),.3,sin(camT))*camR;
    vec3 camC=vec3(0.,-.1,0.);
    vec3 camA=vec3(0.,1.,0.);
    vec3 camS=cross(normalize(camC-camP),camA);
    vec3 camU=cross(camS,normalize(camC-camP));
    vec3 ray=normalize(camS*p.x+camU*p.y+normalize(camC-camP));

    vec2 dist=v.xx;
    float rayL=0.;
    vec3 rayP=camP;
    for(int i=0;i<ITER;i++)
    {
      dist=distFunc(rayP);
      rayL+=dist.x*.8;
      if(length(camP)*10.<rayL){ break; }
      rayP=camP+ray*rayL;
    }

    vec3 col=v.xxx;

    if(abs(dist.x)<1E-3)
    {
      float dis=1.6/clamp(rayL,1.8,99.);
      if(dist.y==0.)
      {
        col+=shadeGeta(rayP,camP);
      }
      if(dist.y==1.)
      {
        col+=shadeShari(rayP,camP);
      }
      if(dist.y==2.)
      {
        col+=shadeNeta(rayP,camP);
      }
    }
    else
    {
      col=vec3(.1,.8,.4);
      col+=cl((sin(atan(p.y,p.x)*40.+length(p)*20.+t*10.))*9.)*vec3(.1,-.3,.4);
    }

    col-=length(p)*.2*v.yyy;

    gl_FragColor=vec4(col,1.);
  }
