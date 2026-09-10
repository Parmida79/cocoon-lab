import * as THREE from 'three';
import {OrbitControls} from '../vendor/OrbitControls.js';
import {fraction, sample} from './model.js';
import {createRenderer} from './renderer.js';
export function createScene(host,onStatus){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#13232e');scene.fog=new THREE.Fog('#13232e',22,65);
 const renderer=createRenderer(host,onStatus,{forceSoftware:new URLSearchParams(location.search).get('renderer')==='software'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 const camera=new THREE.PerspectiveCamera(40,1,.05,120);const controls=new OrbitControls(camera,host);controls.enableDamping=true;controls.maxDistance=24;controls.minDistance=2;controls.maxPolarAngle=Math.PI*.49;
 scene.add(new THREE.HemisphereLight(0xcfefff,0x24313d,2.3));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(4,12,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;scene.add(sun);
 const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
 const bodyMat=material('#c2c9cb'),jointMat=material('#394b56'),amber=material('#edb96b'),dark=material('#18232d');
 function box(parent,size,pos,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function ellipsoid(parent,size,pos,mat){const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),mat);m.scale.set(...size);m.position.set(...pos);m.castShadow=true;parent.add(m);return m;}
 function limb(parent,a,b,r){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.01,v.length()-2*r),8,16),bodyMat);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());parent.add(m);m.castShadow=true;ellipsoid(parent,[r*1.1,r*1.1,r*1.1],b,jointMat);}
 box(scene,[70,.12,70],[0,-.08,0],material('#1b303c')).userData.skipSoftware=true;const grid=new THREE.GridHelper(60,60,0x47606b,0x29404b);grid.position.y=-.013;scene.add(grid);
 const world=new THREE.Group();scene.add(world);const dummy=new THREE.Group();scene.add(dummy);const form=new THREE.Group();dummy.add(form);
 ellipsoid(form,[.22,.31,.135],[0,.34,0],bodyMat);ellipsoid(form,[.20,.16,.13],[0,0,0],bodyMat);limb(form,[0,.59,0],[0,.69,0],.065);ellipsoid(form,[.115,.145,.115],[0,.81,0],bodyMat);
 ellipsoid(form,[.13,.09,.13],[0,.91,0],amber);box(form,[.19,.026,.017],[0,.83,.109],dark);
 for(const side of [-1,1]){limb(form,[side*.25,.55,0],[side*.33,.23,0],.062);limb(form,[side*.33,.23,0],[side*.33,-.05,.02],.05);ellipsoid(form,[.06,.08,.045],[side*.33,-.13,.02],bodyMat);limb(form,[side*.12,-.06,0],[side*.13,-.44,.025],.09);limb(form,[side*.13,-.44,.025],[side*.14,-.78,0],.066);box(form,[.14,.10,.24],[side*.14,-.83,.07],dark);
 box(form,[.035,.54,.025],[side*.13,.35,.14],dark);}
 box(form,[.41,.045,.29],[0,.02,0],dark);box(form,[.06,.13,.09],[.245,.025,0],amber);box(form,[.065,.14,.09],[-.245,.025,0],dark);
 box(form,[.05,.04,.022],[0,.47,-.14],amber);box(form,[.05,.04,.022],[0,0,-.145],amber);
 const bags=[];
 // Each lobe has a fixed inner tangent: center moves outward by its growing radius.
 function lobe(id,anchor,normal,span){const mat=material('#55cdb8',{transparent:true,opacity:.63,metalness:.1});const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),mat);form.add(m);bags.push({id,m,anchor,normal,span});}
 for(const s of [-1,1]){
 lobe('head',[s*.13,.83,0],[s,0,0],[0,.18,.16]);lobe('torso',[s*.225,.33,0],[s,0,0],[0,.34,.18]);lobe('pelvis',[s*.2,-.015,0],[s,0,0],[0,.19,.17]);
 lobe('collar',[s*.16,.60,0],[0,1,0],[.12,0,.16]);
 for(const y of [-.28,-.64]){lobe('legs',[s*.14,y,-.08],[0,0,-1],[.13,.2,0]);lobe('legs',[s*.22,y,0],[s,0,0],[0,.2,.12]);}
 }
 lobe('head',[0,.84,-.12],[0,0,-1],[.16,.17,0]);lobe('head',[0,.99,0],[0,1,0],[.17,0,.16]);
 lobe('torso',[0,.34,-.145],[0,0,-1],[.245,.35,0]);lobe('torso',[0,.35,.145],[0,0,1],[.24,.32,0]);lobe('pelvis',[0,0,-.145],[0,0,-1],[.22,.19,0]);
 let result,car,building;
 function inflate(t){for(const b of bags){const f=fraction(result.p,t,b.id);const r=.009+result.p.thickness*f/2;const vals=b.span.map((v,i)=>b.normal[i]?r:v*(.35+.65*f));b.m.scale.set(...vals);b.m.position.set(...b.anchor.map((a,i)=>a+b.normal[i]*r));b.m.visible=b.id!=='legs'||result.p.legs;b.m.material.color.set(result.p.failure===b.id?'#edb96b':'#55cdb8');}}
 function setResult(r){result=r;world.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});world.clear();form.scale.setScalar(r.p.stature/1.88);
 dummy.rotation.set(0,0,0);if(r.p.orientation==='back')dummy.rotation.x=-Math.PI/2;if(r.p.orientation==='side')dummy.rotation.z=Math.PI/2;if(r.p.orientation==='head')dummy.rotation.z=Math.PI;
 const wall=material('#34444e');building=new THREE.Group();world.add(building);const h=r.p.scenario==='fall'?r.p.height:3.3;box(building,[3,h,4],[-3,h/2,-1.5],wall);box(building,[3.2,.12,4.2],[-3,h+.06,-1.5],material('#647276'));
 for(let x=-4;x<-1.8;x+=.75)for(let y=.65;y<h-.2;y+=1.1)box(building,[.4,.6,.03],[x,y,.516],material('#1a2d38'));
 if(r.p.scenario==='car'){building.position.set(-4,0,-5);box(world,[20,.012,4],[0,0,0],material('#263842'));for(let x=-10;x<10;x+=2)box(world,[.9,.016,.06],[x,.01,1.5],material('#b1b8ae'));car=new THREE.Group();world.add(car);box(car,[3.8,.48,1.65],[0,.64,0],material('#b3bdc2',{metalness:.5}));box(car,[1.8,.6,1.45],[-.35,1.15,0],material('#455e6c',{metalness:.5}));box(car,[.07,.20,1.52],[1.93,.68,0],amber);for(const x of [-1.25,1.2])for(const z of [-.8,.8]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.21,24),dark);w.rotation.x=Math.PI/2;w.position.set(x,.37,z);car.add(w);}}
 else car=null;resetCamera();update(0);}
 function resetCamera(){const h=result?.p.scenario==='fall'?result.p.height:1.5;controls.target.set(0,h*.45+.65,0);camera.position.set(7,h*.5+4.8,9);controls.update();}
 function update(t){if(!result)return;inflate(result.impact);dummy.position.set(0,0,0);dummy.updateMatrixWorld(true);const minY=new THREE.Box3().setFromObject(dummy).min.y;const s=sample(result,t);dummy.position.set(s.x,-minY+(result.p.scenario==='fall'?result.p.height:result.p.stature*.55)-s.drop,0);inflate(t);
 if(car){car.position.x=-2.0-(Math.max(0,result.release-t))*result.p.speed/3.6;}
 controls.update();renderer.render(scene,camera);}
 const resize=new ResizeObserver(()=>{if(!host.clientWidth||!host.clientHeight)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);});resize.observe(host);
 return {setResult,update,resetCamera,useSoftware:()=>renderer.useSoftware()};
}
