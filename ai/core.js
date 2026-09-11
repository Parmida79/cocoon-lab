// SI units. Input positions are tracked object centers relative to the wearer,
// in a gravity-aligned frame with fixed world-axis orientation over the window.
// Raw radar detections, pixels and rotating body-frame coordinates are not inputs.
export const POLICY = Object.freeze({horizon:3, maxAge:.15, maxGap:.15,
  minSpan:.25, minSamples:6, maxFitError:.45, budget:.32});
export const FEATURES=['range','closing','closest','ttc','fitError','speed'];
const norm=(x,y)=>Math.hypot(x,y);
export function encounter(x,y,vx,vy,radius,horizon=3){
 const c=x*x+y*y-radius*radius,a=vx*vx+vy*vy,b=2*(x*vx+y*vy);
 if(c<=0)return {ttc:0,closest:0,contact:true};
 const closestAt=a>1e-9?Math.max(0,Math.min(horizon,-b/(2*a))):0;
 const closest=norm(x+vx*closestAt,y+vy*closestAt);
 const d=b*b-4*a*c;
 const root=a>1e-9&&b<0&&d>=0?(-b-Math.sqrt(d))/(2*a):Infinity;
 return {ttc:root>=0&&root<=horizon?root:null,closest,contact:false};
}
export function validate(input){
 if(!input||input.frame!=='wearer_relative_world_axes_m')throw new Error('Use wearer_relative_world_axes_m coordinates; pixels and body-frame tracks are unsupported.');
 const {samples,now,objectRadius,wearerRadius}=input;
 if(!Array.isArray(samples)||samples.length<2||samples.length>200)throw new Error('Provide 2–200 tracked samples.');
 for(const [name,value,lo,hi] of [['now',now,0,1e12],['objectRadius',objectRadius,.05,10],['wearerRadius',wearerRadius,.1,2],['positionSigma',input.positionSigma,0,5]])
  if(!Number.isFinite(value)||value<lo||value>hi)throw new Error(`Invalid ${name}.`);
 let previous=-Infinity;
 for(const s of samples){
  if(!s||![s.t,s.x,s.y].every(Number.isFinite)||s.t<0||Math.abs(s.x)>500||Math.abs(s.y)>500||s.t<=previous)throw new Error('Samples need finite positions and strictly increasing, nonnegative timestamps.');
  previous=s.t;
 }
 if(now<previous)throw new Error('Newest measurement cannot be in the future.');
 return input;
}
export function track(input){
 validate(input);
 const ss=input.samples.slice(-12),last=ss.at(-1),ts=ss.map(s=>s.t-last.t);
 const avg=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
 const mt=avg(ts),mx=avg(ss.map(s=>s.x)),my=avg(ss.map(s=>s.y));
 const denom=ts.reduce((sum,t)=>sum+(t-mt)**2,0);
 if(denom<1e-12)throw new Error('Observation span too short.');
 const vx=ss.reduce((sum,s,i)=>sum+(ts[i]-mt)*(s.x-mx),0)/denom;
 const vy=ss.reduce((sum,s,i)=>sum+(ts[i]-mt)*(s.y-my),0)/denom;
 const x0=mx-vx*mt,y0=my-vy*mt,age=input.now-last.t;
 const fitError=Math.sqrt(avg(ss.map((s,i)=>(s.x-x0-vx*ts[i])**2+(s.y-y0-vy*ts[i])**2)));
 const span=last.t-ss[0].t;
 const maxGap=Math.max(...ss.slice(1).map((s,i)=>s.t-ss[i].t));
 const x=x0+vx*age,y=y0+vy*age,range=norm(x,y),speed=norm(vx,vy);
 const radius=input.objectRadius+input.wearerRadius;
 const nominal=encounter(x,y,vx,vy,radius,POLICY.horizon);
 // Heuristic uncertainty envelope, NOT a calibrated confidence interval.
 const uncertainty=2*input.positionSigma+fitError+fitError/Math.max(span,.01)*POLICY.horizon;
 const possible=encounter(x,y,vx,vy,radius+uncertainty,POLICY.horizon);
 const reasons=[];
 if(ss.length<POLICY.minSamples||span<POLICY.minSpan)reasons.push('Insufficient observation history');
 if(age>POLICY.maxAge)reasons.push('Stale measurements');
 if(maxGap>POLICY.maxGap)reasons.push('Sampling gap');
 if(fitError>POLICY.maxFitError)reasons.push('Motion does not fit the constant-velocity model');
 if(input.positionSigma>.5)reasons.push('High position uncertainty');
 if(speed>45)reasons.push('Relative speed outside the prototype envelope');
 return {x,y,vx,vy,range,speed,radius,uncertainty,fitError,age,span,nominal,possible,reasons,
  features:[range/30,range>0?-(x*vx+y*vy)/range/15:0,nominal.closest/5,(nominal.ttc??4)/4,fitError,speed/20]};
}
export function score(features,model){
 if(!model||model.featureNames?.join(',')!==FEATURES.join(',')||model.weights?.length!==features.length||![model.bias,...model.weights].every(Number.isFinite))throw new Error('Missing or incompatible learned model artifact.');
 const z=Math.max(-40,Math.min(40,model.bias+features.reduce((s,x,i)=>s+x*model.weights[i],0)));
 return 1/(1+Math.exp(-z));
}
export function predict(input,model){
 const state=track(input);
 let status='NO_PREDICTED_CONTACT';
 if(state.reasons.length)status='UNCERTAIN';
 else if(state.nominal.contact)status='CONTACT_ALREADY';
 else if(state.nominal.ttc!==null)status=state.nominal.ttc<=POLICY.budget?'TOO_LATE':'PREDICTED_CONFLICT';
 else if(state.possible.ttc!==null)status='UNCERTAIN';
 const learnedScore=score(state.features,model);
 return {schemaVersion:1,status,learnedScore,scoreMeaning:'Experimental synthetic-trained score; not a real-world probability',
  timingMargin:state.nominal.ttc===null?null:state.nominal.ttc-POLICY.budget,
  decisionBudget:POLICY.budget,modelId:model.id,trainingDomain:model.trainingDomain,
  hardwareDeploymentAuthorized:false,physicallyValidated:false,...state};
}
export function explain(result){
 const explanations={
  NO_PREDICTED_CONTACT:'The tracked path does not intersect the modeled wearer envelope within three seconds. This is not an all-clear: occluded objects and changing trajectories are not covered.',
  PREDICTED_CONFLICT:'The estimated path intersects the wearer envelope before contact. The timing margin subtracts an assumed 320 ms sensing-to-inflation budget; actual protective inflation has not been measured.',
  TOO_LATE:'The predicted contact leaves less time than the assumed deployment budget. This fails the pre-impact timing requirement.',
  CONTACT_ALREADY:'The modeled envelopes already overlap. Pre-impact protection is no longer achievable for this first contact.',
  UNCERTAIN:'The observations do not support a reliable decision, or an expanded uncertainty envelope intersects the path. Uncertainty is not a safe condition.'
 };
 return {text:explanations[result.status],reasons:result.reasons,
  evidence:{ttcSeconds:result.nominal.ttc,fitResidualMeters:result.fitError,ageSeconds:result.age},
  source:'docs/AI-MODEL-CARD.md',kind:'Deterministic explanation of model output; not a language model'};
}
