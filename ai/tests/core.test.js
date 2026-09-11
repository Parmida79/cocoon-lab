import test from 'node:test';import assert from 'node:assert/strict';
import {encounter,track,predict,explain,FEATURES} from '../core.js';import {preset,generateSessions,examples} from '../scenarios.js';import {groupedSplit,validateDataset} from '../dataset.js';
const model={id:'test',featureNames:FEATURES,weights:[0,0,0,0,0,0],bias:0,trainingDomain:'synthetic_only'};
test('analytic head-on intersection uses finite envelopes',()=>{assert.equal(encounter(10,0,-5,0,2).ttc,1.6);});
test('near miss, receding, stationary and overlap are distinct',()=>{assert.equal(encounter(10,3,-5,0,2).ttc,null);assert.equal(encounter(10,0,5,0,2).ttc,null);assert.equal(encounter(10,0,0,0,2).ttc,null);assert.equal(encounter(1,0,0,0,2).contact,true);});
test('constant velocity is recovered from history only',()=>{const s=track(preset());assert.ok(Math.abs(s.vx+8)<1e-9);assert.ok(Math.abs(s.vy)<1e-9);});
test('pre-impact warning and missed deadline are different',()=>{assert.equal(predict(preset('approaching'),model).status,'PREDICTED_CONFLICT');assert.equal(predict(preset('late'),model).status,'TOO_LATE');});
test('stale observations abstain, even if a threat score is high',()=>{const r=predict(preset('stale'),{...model,bias:30});assert.equal(r.status,'UNCERTAIN');assert.ok(r.reasons.includes('Stale measurements'));assert.equal(r.hardwareDeploymentAuthorized,false);});
test('short history and sampling gaps abstain',()=>{const p=preset();p.samples=p.samples.slice(-3);assert.equal(predict(p,model).status,'UNCERTAIN');const q=preset();q.samples=q.samples.filter((_,i)=>i<3||i>6);assert.equal(predict(q,model).status,'UNCERTAIN');});
test('pixels, NaN, future and unsorted timestamps are rejected',()=>{assert.throws(()=>track({...preset(),frame:'pixels'}));const p=preset();p.samples[0].x=NaN;assert.throws(()=>track(p));assert.throws(()=>track({...preset(),now:0}));const q=preset();q.samples.reverse();assert.throws(()=>track(q));});
test('uncertain envelope prevents unjustified all-clear',()=>{const p=preset('passing');p.samples.forEach(s=>s.y=2);p.positionSigma=.2;assert.equal(predict(p,model).status,'UNCERTAIN');});
test('nonlinear motion triggers model mismatch',()=>{assert.equal(predict(preset('turning'),model).status,'UNCERTAIN');});
test('unknown model schema cannot silently produce a score',()=>{assert.throws(()=>predict(preset(),{...model,weights:[]}));});
test('explanation reflects output and never authorizes hardware',()=>{const r=predict(preset(),model);assert.match(explain(r).text,/intersects/);assert.equal(r.hardwareDeploymentAuthorized,false);});
test('recording groups never cross split boundaries',()=>{const sessions=generateSessions(60);sessions.forEach((s,i)=>s.groupId='group-'+Math.floor(i/2));const splits=groupedSplit(sessions);const sets=Object.values(splits).map(ss=>new Set(ss.map(s=>s.groupId)));for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)assert.ok([...sets[a]].every(g=>!sets[b].has(g)));});
test('changing future labels does not alter observed features',()=>{const sessions=generateSessions(30);const before=examples(sessions)[0];sessions[0].points.slice(30).forEach(s=>s.y+=100);const after=examples(sessions)[0];assert.deepEqual(track(before.input).features,track(after.input).features);});
test('dataset requires provenance and aligned tracks',()=>{assert.throws(()=>validateDataset({sessions:[]}));const d={domain:'synthetic_only',provenance:'test',license:'test',sessions:generateSessions(30)};assert.equal(validateDataset(d),d);d.sessions[0].observed[0].t=.001;assert.throws(()=>validateDataset(d));});

test('stale extrapolated overlap is still uncertain',()=>{const p=preset('late');p.now+=.2;assert.equal(predict(p,model).status,'UNCERTAIN');});
