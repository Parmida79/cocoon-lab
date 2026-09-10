import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {SoftwareRenderer,createRenderer} from '../src/renderer.js';
function harness(){const events={},status=[],host={replaceChildren(node){this.child=node;}};let draws=0;
 const ctx={setTransform(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){draws++;},stroke(){}};
 const canvas={style:{},getContext(type){assert.equal(type,'2d');return ctx;}};
 const gpu={domElement:{addEventListener(name,cb){events[name]=cb;}},shadowMap:{},debug:{},setPixelRatio(){},setSize(){},render(){},dispose(){this.disposed=true;}};
 return {events,status,host,gpu,canvas,draws:()=>draws,options:{webglFactory:()=>gpu,softwareFactory:()=>new SoftwareRenderer(canvas)}};}
test('unavailable GPU switches to 2D without requiring another WebGL context',()=>{const h=harness();h.options.webglFactory=()=>{throw new Error('GL_RENDERER = Disabled');};createRenderer(h.host,(...s)=>h.status.push(s),h.options);assert.equal(h.host.child,h.canvas);assert.match(h.status[0][1],/Disabled/);});
test('shader failure switches renderers and stops using failing GPU',()=>{const h=harness();h.gpu.render=()=>h.gpu.debug.onShaderError({getProgramInfoLog:()=>''},{});const r=createRenderer(h.host,()=>{},h.options);r.render(new THREE.Scene(),new THREE.PerspectiveCamera());assert.equal(h.host.child,h.canvas);assert.equal(h.gpu.disposed,true);});
test('context loss switches on the next frame',()=>{const h=harness();const r=createRenderer(h.host,()=>{},h.options);h.events.webglcontextlost();r.render(new THREE.Scene(),new THREE.PerspectiveCamera());assert.equal(h.host.child,h.canvas);});
test('software path draws projected scene geometry, honors size and hidden meshes',()=>{const h=harness();const r=new SoftwareRenderer(h.canvas);r.setSize(640,480);const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,640/480,.1,100);camera.position.z=5;const mesh=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial());scene.add(mesh);r.render(scene,camera);assert.ok(h.draws()>0);const before=h.draws();mesh.visible=false;r.render(scene,camera);assert.equal(h.draws(),before);assert.equal(h.canvas.width,640);});
test('forced software does not call the GPU factory',()=>{const h=harness();h.options.forceSoftware=true;h.options.webglFactory=()=>assert.fail('GPU must not be requested');createRenderer(h.host,()=>{},h.options);assert.equal(h.host.child,h.canvas);});
