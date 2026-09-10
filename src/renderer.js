import * as THREE from '../vendor/three.module.js';

// CPU projection of the same scene geometry. No WebGL context or shaders.
// Painter ordering and flat, opaque shading trade visual fidelity for compatibility.
export class SoftwareRenderer {
 constructor(canvas=document.createElement('canvas')) {
  this.domElement=canvas;this.ctx=canvas.getContext('2d');
  if(!this.ctx)throw new Error('The browser refused a Canvas 2D context as well.');
  this.width=1;this.height=1;this.ratio=1;
 }
 setPixelRatio(r){this.ratio=Math.min(r,1.5);}
 setSize(w,h){this.width=w;this.height=h;this.domElement.width=Math.round(w*this.ratio);this.domElement.height=Math.round(h*this.ratio);this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';}
 dispose(){}
 render(scene,camera){
  scene.updateMatrixWorld();camera.updateMatrixWorld();
  const ctx=this.ctx,w=this.width,h=this.height;
  ctx.setTransform(this.ratio,0,0,this.ratio,0,0);ctx.fillStyle=scene.background?.getStyle()||'#13232e';ctx.fillRect(0,0,w,h);
  const vp=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),faces=[];
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),normal=new THREE.Vector3(),ab=new THREE.Vector3(),ac=new THREE.Vector3();
  const light=new THREE.Vector3(.4,.8,.5).normalize();
  scene.traverseVisible(obj=>{
   if(!obj.isMesh||obj.userData.skipSoftware)return;
   const mat=Array.isArray(obj.material)?obj.material[0]:obj.material;
   if(!mat?.visible)return;
   const geo=obj.geometry,pos=geo.attributes.position,index=geo.index;
   if(!pos)return;
   const screen=[];
   for(let i=0;i<pos.count;i++){
    const v=new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(obj.matrixWorld).applyMatrix4(vp);
    screen.push([(v.x+1)*w/2,(1-v.y)*h/2,v.z]);
   }
   const count=index?index.count:pos.count;
   for(let i=0;i<count;i+=3){
    const ia=index?index.getX(i):i,ib=index?index.getX(i+1):i+1,ic=index?index.getX(i+2):i+2;
    const points=[screen[ia],screen[ib],screen[ic]];
    if(points.some(p=>!p.every(Number.isFinite)||p[2]<-1||p[2]>1))continue;
    if(points.every(p=>p[0]<0)||points.every(p=>p[0]>w)||points.every(p=>p[1]<0)||points.every(p=>p[1]>h))continue;
    const [u,v,q]=points;if((v[0]-u[0])*(q[1]-u[1])-(v[1]-u[1])*(q[0]-u[0])>=0)continue;
    a.fromBufferAttribute(pos,ia).applyMatrix4(obj.matrixWorld);b.fromBufferAttribute(pos,ib).applyMatrix4(obj.matrixWorld);c.fromBufferAttribute(pos,ic).applyMatrix4(obj.matrixWorld);
    normal.crossVectors(ab.subVectors(b,a),ac.subVectors(c,a)).normalize();
    const color=(mat.color||new THREE.Color('white')).clone().multiplyScalar(.5+.5*Math.max(0,normal.dot(light)));
    faces.push({points,depth:(u[2]+v[2]+q[2])/3,color:color.getStyle()});
   }
  });
  faces.sort((a,b)=>b.depth-a.depth);
  for(const f of faces){ctx.fillStyle=f.color;ctx.strokeStyle=f.color;ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(...f.points[0].slice(0,2));ctx.lineTo(...f.points[1].slice(0,2));ctx.lineTo(...f.points[2].slice(0,2));ctx.closePath();ctx.fill();ctx.stroke();}
 }
}

export function createRenderer(host,onStatus=()=>{},options={}){
 let renderer,width=1,height=1,ratio=1,pending=null;
 const factory=options.webglFactory||(()=>new THREE.WebGLRenderer({antialias:false,powerPreference:'default'}));
 const software=options.softwareFactory||(()=>new SoftwareRenderer());
 function fallback(reason){
  const old=renderer;renderer=software();renderer.setPixelRatio(ratio);renderer.setSize(width,height);host.replaceChildren(renderer.domElement);
  try{old?.dispose();}catch{/* Failed GPU contexts can also fail disposal. */}
  pending=null;onStatus('Compatibility 3D · simplified shading',reason);
 }
 try{
  if(options.forceSoftware)throw new Error('Compatibility view selected.');
  renderer=factory();renderer.shadowMap.enabled=false;
  renderer.debug.onShaderError=(gl,program)=>{throw new Error('Shader compilation failed: '+(gl.getProgramInfoLog(program)||'no driver details'));};
  renderer.domElement.addEventListener('webglcontextlost',()=>{pending='The browser lost its WebGL graphics context.';});
  host.replaceChildren(renderer.domElement);onStatus('WebGL 2','');
 }catch(error){fallback(error.message);}
 return {
  setPixelRatio(r){ratio=r;renderer.setPixelRatio(r);},
  setSize(w,h){width=w;height=h;renderer.setSize(w,h);},
  render(scene,camera){
   if(pending)fallback(pending);
   try{renderer.render(scene,camera);}catch(error){if(renderer instanceof SoftwareRenderer)throw error;fallback(error.message);renderer.render(scene,camera);}
  },
  useSoftware(){if(!(renderer instanceof SoftwareRenderer))fallback('Compatibility view selected.');}
 };
}
