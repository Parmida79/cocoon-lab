import {predict,explain} from './core.js';
let model;
self.onmessage=async({data})=>{
 try{
  if(!model){const response=await fetch('./artifacts/model.json');if(!response.ok)throw new Error('Model artifact unavailable.');model=await response.json();}
  const result=predict(data.input,model);
  self.postMessage({id:data.id,result,assistant:explain(result)});
 }catch(error){self.postMessage({id:data.id,error:error.message});}
};
