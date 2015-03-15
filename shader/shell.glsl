// FMS_Cat - Shell
// GLSL Graphics for Tokyo Demo Fest 2015
// 2015/02/22
//
// Greeting:
//   doxas
//   gyabo
//   Jugem-T
//   RTX1911

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define C vec3(.5,.1,.2)*2.
#define ITER 72
#define SITER 32

#define tMax 40.
#define t mod(time,tMax)
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

vec2 rotate(vec2 i,float th)
{
  return mat2(cos(th),-sin(th),sin(th),cos(th))*i;
}

float box(vec3 p,vec3 b)
{
  vec3 d=abs(p)-b;
  return min(max(d.x,max(d.y,d.z)),0.)+length(max(d,0.));
}

float box(vec3 p,float b){return box(p,vec3(b));}

float bar(vec2 p,vec2 b)
{
  vec2 d=abs(p)-b;
  return min(max(d.x,d.y),0.)+length(max(d,0.));
}

float crossBar(vec3 p,float b)
{
  float da=bar(p.xy,vec2(b)),
  db=bar(p.yz,vec2(b)),
  dc=bar(p.zx,vec2(b));
  return min(da,min(db,dc));
}

float spongePre(vec3 p)
{
  p.xy=rotate(p.xy,t*.23);
  p.yz=rotate(p.yz,t*.13);
  p.zx=rotate(p.zx,t*.43);
  return box(p,.4);
}

vec2 sponge(vec3 p)
{
  p.xy=rotate(p.xy,t*.23);
  p.yz=rotate(p.yz,t*.13);
  p.zx=rotate(p.zx,t*.43);
  float ret=box(p,.4);
  vec3 pt=p;
  for(float c=0.;c<4.;c+=1.)
  {
    p=pt;
    float h0=pow(1.17+hash(floor(t/5.+361.)*v.yy),c*.5);
    float h1=pow(1.17+hash(ceil(t/5.+361.)*v.yy),c*.5);
    float pw=h1+exp(-mod(t,5.)*12.)*(h0-h1);
    ret=max(ret,-crossBar(mod(p+.15/pw,.6/pw)-.15/pw,.1/pw));
  }
  return vec2(ret,0.);
}

vec2 oil(vec3 p)
{
  return vec2(p.y+.9,1.);
}

vec2 flo(vec3 p)
{
  return vec2(max(p.y+.7,.8-length(p.xz)),2.);
}

vec2 pole(vec3 p)
{
  return vec2(length(mod(p.xz,4.)-2.)-.3,2.);
}

#define check if(disC.x<dis.x){dis=disC;}
vec2 distFunc(vec3 p)
{
  vec2 dis=spongePre(p)*v.yx;
  if(dis.x<.1)
  {
    dis=sponge(p);
  }
  vec2 disC=oil(p);check;
  disC=flo(p);check;
  disC=pole(p);check;
  return dis;
}

vec2 tube(vec3 p)
{
  vec2 dis=vec2(max(length(p.xz)-.8,-p.y-.7),0.);
  vec2 disC=pole(p);check;
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

vec3 shadeBox(vec3 rayP,vec3 camP)
{
  vec3 col=v.xxx;

  vec3 nor=getNormal(rayP,1E-4);

  vec3 lig=v.xxx;
  float dif=cl(dot(normalize(lig-rayP),nor))*.3;
  float sha=shadow(rayP+1E-2*nor,lig,3E1);
  float dec=exp(-length(lig-rayP)*.1);
  col+=(dif*(sha*.5+.5)*dec*v.yyy)*C;

  float edge=pow(cl((1.-dot(nor,getNormal(rayP,6E-3)))*8.+.1),14.)*(.01+floor(cl(1.-abs(mod(t/5.,1.)-length(rayP))*12.)*2.)*.4);
  col+=edge*C;

  return col;
}

vec3 shadeOil(vec3 rayP,vec3 camP)
{
  vec3 col=v.xxx;

  vec3 nor=v.xyx;
  nor.x+=(noiseT(rayP.xz*11.)-.5)*3.;
  nor.z+=(noiseT(rayP.xz*11.+v.yy*29.)-.5)*3.;
  nor=normalize(nor);

  vec3 lig=v.xxx;
  float sha=shadow(rayP+1E-2*nor,lig,3E1);
  float spe=cl(pow(dot(normalize(normalize(lig-rayP)+normalize(camP-rayP)),nor)*1.02,3E2));
  col+=spe*(sha*.9+.1)*C;

  return col;
}

vec3 shadeFloor(vec3 rayP,vec3 camP)
{
  vec3 col=v.xxx;

  vec3 nor=getNormal(rayP,1E-4);

  vec3 lig=v.xxx;
  float sha=shadow(rayP+1E-2*nor,lig,3E1);
  float dif=cl(dot(normalize(lig-rayP),nor));
  float spe=cl(pow(dot(normalize(normalize(lig-rayP)+normalize(camP-rayP)),nor),3E2));
  float dec=exp(-length(lig-rayP)*.1);
  col+=((dif*(sha*.7+.3))*v.yyy*dec+spe*sha*dec)*C;

  float edge=cl(1.-abs(.3-rayP.y)*70.)*3.;
  col+=edge*C;

  return col;
}

void main()
{
  vec2 p=(gl_FragCoord.xy*2.-r)/r.x;
  p.x+=((hash(floor(p.yy*100.))-.5))*exp(-t*.8)*.4; // first horizontal glitch
  p.x+=hash(vec2(p.y,t*8.))*exp(-(tMax-t))*.2; // last horizontal noise

  float camR=4.+exp(-t*.4)*10.;
  if(8.<t){ camR-=(1.-exp(-(t-8.)*5.))*2.; }

  float camT=t*.1+.3;
  if(8.<t){ camT+=(1.-exp(-(t-8.)*5.))*.4; }

  vec3 camP=vec3(cos(camT),.1,sin(camT))*camR;
  vec3 camC=vec3(0.,-.2,0.);
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
    rayL+=dist.x*.95;
    if(length(camP)*10.<rayL){ break; }
    rayP=camP+ray*rayL;
  }

  vec3 col=v.xxx;

  if(abs(dist.x)<1E-3)
  {
    float dis=1.6/clamp(rayL,1.8,99.);
    if(dist.y==0.)
    {
      col+=shadeBox(rayP,camP);
    }
    else if(dist.y==1.)
    {
      col+=shadeOil(rayP,camP);
    }
    else if(dist.y==2.)
    {
      col+=shadeFloor(rayP,camP);
    }
  }

  col+=cl(1.-(abs(min(rayL,length(camP))-length(camP))*10.))*pow(cl(dot(-ray,normalize(camP))),1E3*length(camP))*(C+v.yyy);

  if(.8<length(camP.xz))
  {
    rayL=0.;
    rayP=camP;
    for(int i=0;i<ITER;i++)
    {
      dist=tube(rayP);
      rayL+=dist.x;
      if(length(camP)*2.<rayL){ break; }
      rayP=camP+ray*rayL;
    }

    if(dist.x<1E-3&&dist.y==0.)
    {
      col+=(C+v.yyy)*max(.2-rayP.y*.1,.05)*.2;

      vec3 lig=v.xxx;
      float sha=shadow(rayP,lig,3E1);
      float dec=exp(-length(lig-rayP)*.1);
      col+=.03*sha*dec*C;
    }
  }

  col+=shadow(camP+ray*.1,v.xxx,3E1)*exp(-length(camP)*.1)*C*.4;

  col=cl(cl(col+sin(p.y*500.+t*10.)*.003)*5.*exp(-length(p)*2.))-exp(-t*.8)-exp(-(tMax-t));

  gl_FragColor=vec4(col,1.);
}
