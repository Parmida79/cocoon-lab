import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {FEATURES,track,score,predict,POLICY} from './core.js';
import {validateDataset,groupedSplit} from './dataset.js';
import {generateSessions,examples,inputFrom} from './scenarios.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2),dataIndex=args.indexOf('--dataset'),outIndex=args.indexOf('--out');
const dataset=dataIndex>=0?validateDataset(JSON.parse(fs.readFileSync(args[dataIndex+1],'utf8'))):{domain:'synthetic_only',provenance:'Cocoon generator seed 240911',license:'Project-generated fixtures',sessions:generateSessions()};
if(dataIndex>=0&&outIndex<0)throw new Error('Use --out DIR for external datasets so reviewed demo artifacts are not overwritten.');
const output=outIndex>=0?path.resolve(args[outIndex+1]):path.join(root,'artifacts');
const splits=groupedSplit(dataset.sessions);
const data=Object.fromEntries(Object.entries(splits).map(([k,v])=>[k,examples(v).map(e=>({...e,features:track(e.input).features}))]));
for(const [name,rows] of Object.entries(data)){if(new Set(rows.map(r=>r.label)).size<2)throw new Error(name+' needs both contact and non-contact labels.');}
const model={id:'cocoon-collision-logistic-v0.1',featureNames:FEATURES,weights:FEATURES.map(()=>0),bias:0,trainingDomain:dataset.domain,qualified:false};
let best=Infinity,bestWeights,bestBias,bestEpoch;
function loss(rows){return rows.reduce((s,r)=>{const p=Math.max(1e-9,Math.min(1-1e-9,score(r.features,model)));return s-r.label*Math.log(p)-(1-r.label)*Math.log(1-p);},0)/rows.length;}
for(let epoch=0;epoch<350;epoch++){
 const grad=FEATURES.map(()=>0);let gb=0;
 for(const row of data.train){const err=score(row.features,model)-row.label;gb+=err;row.features.forEach((v,j)=>grad[j]+=v*err);}
 model.weights=model.weights.map((w,j)=>w-.18*(grad[j]/data.train.length+.001*w));model.bias-=.18*gb/data.train.length;
 const l=loss(data.validation);if(l<best){best=l;bestWeights=[...model.weights];bestBias=model.bias;bestEpoch=epoch;}
}
model.weights=bestWeights;model.bias=bestBias;
function metrics(rows,threshold){let tp=0,fp=0,tn=0,fn=0,brier=0;for(const r of rows){const p=score(r.features,model),yes=p>=threshold;brier+=(p-r.label)**2;if(yes&&r.label)tp++;else if(yes)fp++;else if(r.label)fn++;else tn++;}return {tp,fp,tn,fn,precision:tp+fp?tp/(tp+fp):null,recall:tp+fn?tp/(tp+fn):null,brier:brier/rows.length};}
let threshold=.5,bestF=-1;
for(let t=.05;t<=.95;t+=.01){const m=metrics(data.validation,t),f=2*m.tp/(2*m.tp+m.fp+m.fn||1);if(f>bestF){bestF=f;threshold=Number(t.toFixed(2));}}
model.threshold=threshold;
const temporal=[];
for(const s of splits.test){
 const contact=s.points.find(p=>Math.hypot(p.x,p.y)<=1.85)?.t??null;
 let first=null,falseTriggers=0,active=false,exposure=0;
 for(let i=11;i<s.points.length;i++){
  if(s.points.at(-1).t-s.points[i].t<POLICY.horizon)break;
  const now=s.points[i].t;if(contact!==null&&now>=contact)break;
  exposure+=s.points[i].t-s.points[i-1].t;const r=predict(inputFrom(s.observed.slice(i-11,i+1),now),model);
  const alert=r.status==='PREDICTED_CONFLICT';
  if(alert&&first===null)first=now;
  if(alert&&!active&&contact===null)falseTriggers++;active=alert;
 }
 temporal.push({id:s.id,contact,first,lead:contact!==null&&first!==null?contact-first:null,falseTriggers,exposure});
}
const contacts=temporal.filter(t=>t.contact!==null),leads=contacts.filter(t=>t.lead!==null).map(t=>t.lead).sort((a,b)=>a-b);
const negativeHours=temporal.filter(t=>t.contact===null).reduce((s,t)=>s+t.exposure,0)/3600;
const report={schemaVersion:1,evidence:dataset.domain==='synthetic_only'?'SYNTHETIC ONLY — NOT REAL-WORLD ACCURACY':'USER-SUPPLIED TRACKS — NOT HARDWARE QUALIFIED',provenance:dataset.provenance,license:dataset.license,
 splits:Object.fromEntries(Object.entries(splits).map(([k,v])=>[k,{sessions:v.length,windows:data[k].length,sessionIds:v.map(s=>s.id)}])),
 fitting:{algorithm:'L2-regularized logistic regression',epoch:bestEpoch,thresholdSelectedOn:'validation',threshold},
 learnedScoreTest:metrics(data.test,threshold),
 constantVelocityBaselineTest:{contacts:contacts.length,missedBeforeContact:contacts.filter(t=>t.first===null).length,
  insufficientTimingMargin:contacts.filter(t=>t.lead===null||t.lead<POLICY.budget).length,
  medianLeadSeconds:leads.length?leads[Math.floor(leads.length/2)]:null,
  falseAlertEpisodes:temporal.reduce((s,t)=>s+t.falseTriggers,0),
  falseAlertEpisodesPerNegativeHour:negativeHours?temporal.reduce((s,t)=>s+t.falseTriggers,0)/negativeHours:null,negativeExposureHours:negativeHours},
 limitations:['Synthetic generator is related to the forecasting assumptions; performance is optimistic.','Labels use geometric envelope overlap, not injury or verified physical collision.','Learned score does not authorize inflation and does not gate the separate baseline.',dataset.domain==='synthetic_only'?'No wearable recordings or public benchmark data were used.':'Provenance supplied by the dataset operator; not independently verified.','False alert rate uses limited synthetic exposure and is not a field estimate.']};
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'model.json'),JSON.stringify(model,null,2)+'\n');
fs.writeFileSync(path.join(output,'evaluation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({model:model.id,domain:model.trainingDomain,test:report.learnedScoreTest,baseline:report.constantVelocityBaselineTest},null,2));
