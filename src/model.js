// Screening model only. SI units throughout; no biomechanical injury prediction.
export const G = 9.81;
export const defaults = {scenario:'fall',height:2,mass:75,stature:1.75,speed:30,transfer:0.35,latency:80,fill:120,thickness:0.18,pressure:35,area:0.08,orientation:'back',failure:'none',legs:true};
export const modules = [
 {id:'head',name:'Cranial halo',group:'A',liters:7},
 {id:'collar',name:'Shoulder / collar',group:'A',liters:6},
 {id:'torso',name:'Thoracic / lumbar',group:'B',liters:20},
 {id:'pelvis',name:'Pelvis',group:'C',liters:12},
 {id:'legs',name:'Thigh / shin',group:'D/E',liters:16}
];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function validate(p){
 for(const [k,lo,hi] of [['height',0.3,6],['mass',45,120],['stature',1.5,2],['speed',10,60],['transfer',0.1,0.7],['latency',0,600],['fill',40,500],['thickness',0.05,0.35],['pressure',5,80],['area',0.02,0.2]])
  if(!Number.isFinite(p[k])||p[k]<lo||p[k]>hi)throw new RangeError(k);
 if(!['fall','car'].includes(p.scenario)||!['back','side','feet','head'].includes(p.orientation)||!['none','torso','sensor','battery'].includes(p.failure))throw new RangeError('Unknown mode');
 return p;
}
export function fraction(p,t,id){
 if(p.failure==='battery'||p.failure==='sensor'||p.failure===id||(id==='legs'&&!p.legs))return 0;
 const trigger=p.scenario==='car'?0.6:0;
 return clamp((t-trigger-p.latency/1000)/(p.fill/1000),0,1);
}
export function simulate(input){
 const p=validate({...defaults,...input});
 const isCar=p.scenario==='car', release=isCar?0.6:0;
 // Pedestrian post-strike velocity is an exposed assumption, NOT solved contact mechanics.
 const vx=isCar?p.speed/3.6*p.transfer:0;
 const drop=isCar?p.stature*0.55:p.height;
 const flight=Math.sqrt(2*drop/G),impact=release+flight;
 const vy=G*flight, energy=0.5*p.mass*(vy*vy+vx*vx);
 const selected=p.orientation==='feet'?'legs':p.orientation==='head'?'head':p.orientation==='side'?'pelvis':'torso';
 const ready=fraction(p,impact,selected),stroke=p.thickness*ready;
 const normalEnergy=0.5*p.mass*vy*vy;
 // Constant effective gauge-pressure screening approximation: W=P*A*s.
 const capacity=p.pressure*1000*p.area*stroke;
 const absorbed=Math.min(normalEnergy,capacity),residual=normalEnergy-absorbed;
 const volume=modules.filter(m=>p.legs||m.id!=='legs').reduce((s,m)=>s+m.liters,0)*(p.stature/1.75)**3*(p.thickness/0.18);
 const freeAir=volume*(101.325+p.pressure)/101.325;
 return {p,release,flight,impact,end:impact+0.6,vx,vy,energy,normalEnergy,selected,ready,stroke,capacity,absorbed,residual,volume,freeAir,
  margin:(impact-release)*1000-p.latency-p.fill,blocked:['sensor','battery'].includes(p.failure),
  idealDistance:normalEnergy/(p.pressure*1000*p.area),
  // Effective constant force / whole-body mass, not local peak acceleration.
  force:p.pressure*1000*p.area};
}
export function sample(r,t){
 const tau=clamp(t-r.release,0,r.flight),airborne=t>=r.release;
 return {time:t,drop:0.5*G*tau*tau,x:r.vx*tau,velocity:airborne?G*tau:0,
  fraction:fraction(r.p,t,r.selected),phase:t<r.release?'Approach':r.blocked?'Deployment inhibited':t>=r.impact?'Ground contact':t<r.release+r.p.latency/1000?'Detection window':fraction(r.p,t,r.selected)<1?'Inflating':'Deployed'};
}
export function csv(r){
 const rows=['time_s,vertical_drop_m,horizontal_displacement_m,vertical_speed_m_s,selected_chamber_fraction,phase'];
 for(let t=0;t<=r.end+0.0001;t+=0.01){const s=sample(r,t);rows.push([t.toFixed(3),s.drop.toFixed(4),s.x.toFixed(4),s.velocity.toFixed(4),s.fraction.toFixed(4),s.phase].join(','));}
 return rows.join('\n');
}
