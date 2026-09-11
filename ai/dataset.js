// Canonical paired reference/observed trajectories, one group per recording session.
// Real radar/video conversion belongs upstream: do not treat pixels as meters.
export function validateDataset(dataset){
 if(!dataset||!['synthetic_only','provided_recorded_tracks'].includes(dataset.domain)||!dataset.provenance?.trim()||!dataset.license?.trim())throw new Error('Dataset must declare domain, provenance and license.');
 if(!Array.isArray(dataset.sessions)||dataset.sessions.length<30)throw new Error('At least 30 sessions are required to exercise grouped evaluation (not a validation sample-size recommendation).');
 const ids=new Set();
 for(const s of dataset.sessions){
  if(typeof s.id!=='string'||ids.has(s.id)||typeof s.groupId!=='string'||!s.groupId)throw new Error('Unique session IDs and nonempty recording group IDs are required.');ids.add(s.id);
  if(!Array.isArray(s.points)||!Array.isArray(s.observed)||s.points.length!==s.observed.length||s.points.length<80)throw new Error('Provide aligned reference and observed tracks with at least 80 samples.');
  let prev=-Infinity;
  s.points.forEach((p,i)=>{const o=s.observed[i];if(!p||!o||![p.t,p.x,p.y,o.t,o.x,o.y].every(Number.isFinite)||p.t!==o.t||p.t<=prev||p.t<0)throw new Error('Tracks must contain finite aligned samples in strictly increasing time order.');prev=p.t;});
  if(s.points.at(-1).t-s.points[0].t<4)throw new Error('A four-second minimum record is required for future labels.');
 }
 return dataset;
}
export function groupedSplit(sessions){
 function hash(s){let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
 const groups=[...new Set(sessions.map(s=>s.groupId||s.id))].sort((a,b)=>hash(a)-hash(b)||a.localeCompare(b));
 if(groups.length<15)throw new Error('Need at least 15 independent recording groups.');
 const a=Math.floor(groups.length*.6),b=Math.floor(groups.length*.8),assignment=new Map(groups.map((g,i)=>[g,i<a?'train':i<b?'validation':'test']));
 const out={train:[],validation:[],test:[]};for(const s of sessions)out[assignment.get(s.groupId||s.id)].push(s);return out;
}
