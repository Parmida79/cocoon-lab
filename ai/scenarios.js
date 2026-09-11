// Synthetic engineering fixtures. These are never labeled as sensor recordings.
export function rng(seed){return ()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};}
export function inputFrom(points,now,extras={}){return {frame:'wearer_relative_world_axes_m',samples:points,now,objectRadius:1.5,wearerRadius:.35,positionSigma:.04,...extras};}
export function preset(name='approaching',time=0){
 const configs={approaching:{x:14,y:0,vx:-8,vy:0},passing:{x:14,y:4,vx:-8,vy:0},receding:{x:5,y:0,vx:5,vy:0},crossing:{x:7,y:6,vx:-5,vy:-4},late:{x:3,y:0,vx:-10,vy:0},stale:{x:14,y:0,vx:-8,vy:0},turning:{x:12,y:2,vx:-5,vy:-1}};
 const c=configs[name]||configs.approaching;
 const points=Array.from({length:12},(_,i)=>{const t=1+time-(11-i)*.05;return {t,x:c.x+c.vx*(t-1),y:c.y+c.vy*(t-1)+(name==='turning'?2*Math.sin(t*25):0)};});
 return inputFrom(points,points.at(-1).t+(name==='stale'?.4:0));
}
export function generateSessions(count=900,seed=240911){
 const random=rng(seed),sessions=[];
 for(let i=0;i<count;i++){
  const kind=i%5,speed=2+random()*14,angle=random()*Math.PI*2,impactTime=1.1+random()*4;
  const offset=kind===0?0:kind===1?.2+random():kind===2?3+random()*5:kind===3?8:1+random()*4;
  const ux=Math.cos(angle),uy=Math.sin(angle),ax=kind===4?(random()-.5)*3:0,ay=kind===4?(random()-.5)*3:0;
  const points=[];
  for(let j=0;j<=160;j++){const t=j*.05;points.push({t,x:ux*speed*(impactTime-t)-uy*offset+.5*ax*t*t,y:uy*speed*(impactTime-t)+ux*offset+.5*ay*t*t});}
  const observed=points.map(s=>({t:s.t,x:s.x+(random()-.5)*.08,y:s.y+(random()-.5)*.08}));
  sessions.push({id:`synthetic-${seed}-${i}`,groupId:`recording-${seed}-${i}`,kind:['collision','grazing','near-miss','passing','acceleration'][kind],source:'synthetic',points,observed});
 }
 return sessions;
}
export function futureContact(session,index,horizon=3){
 const now=session.points[index].t;
 for(const s of session.points.slice(index)){
  if(s.t-now>horizon+1e-8)break;
  if(Math.hypot(s.x,s.y)<=1.85)return s.t;
 }
 return null;
}
export function examples(sessions){
 const rows=[];
 for(const s of sessions)for(let index=12;index<s.points.length;index+=10){
  if(s.points.at(-1).t-s.points[index].t<3)continue;
  if(Math.hypot(s.points[index].x,s.points[index].y)<=1.85)continue;
  const input=inputFrom(s.observed.slice(index-11,index+1),s.points[index].t);
  rows.push({sessionId:s.id,input,label:futureContact(s,index)!==null?1:0});
 }
 return rows;
}
