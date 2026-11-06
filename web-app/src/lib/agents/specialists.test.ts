import {afterEach,describe,expect,it,vi} from "vitest";
import {AGENT_CATALOG} from "./catalog";
import {createAndRunTask,readTask} from "./runtime";
import {withModelSession} from "./model-context";
import {listTasks,clearTasksForTests} from "./store";
const key="visitor-key-123456789";
const brief={title:"Sales quality",problem:"Review sales pipeline quality",missingInformation:[],
 acceptanceCriteria:[{id:"QUALITY",description:"Draft documents explicit input contracts and limitations",measurable:true}],
 proposedSubtasks:["Inspect the supplied schema"],riskNotes:[]};
const research={findings:["Source states 20 rows"],facts:["Source contains a row count"],assumptions:[],limitations:["Requester supplied source only"],evidence:["20 rows"]};
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();clearTasksForTests();});
describe("all callable roles",()=>{
 it("has 15 unique executable roles and keeps Founder human",()=>{
  expect(AGENT_CATALOG).toHaveLength(15);
  expect(new Set(AGENT_CATALOG.map(a=>a.id)).size).toBe(15);
  expect(AGENT_CATALOG.some(a=>String(a.id).includes("founder"))).toBe(false);
 });
 for(const provider of ["openai","anthropic","gemini"] as const){
  it.each(AGENT_CATALOG)("runs $id through "+provider+" with private results",async agent=>{
   vi.stubEnv("GITHUB_TOKEN","owner-token-not-for-visitors");
   vi.stubEnv("OPENAI_API_KEY","owner-key-not-for-visitors");
   const prompts:string[]=[];
   const calls=vi.fn(async(url:string,options:RequestInit)=>{
    expect(url).not.toContain("api.github.com");
    const raw=JSON.parse(String(options.body));
    const system=raw.system||raw.systemInstruction?.parts[0].text||raw.messages[0].content;
    prompts.push(system);
    let data:unknown;
    if(system.includes("Project Intake"))data=brief;
    else if(system.includes("Research and Data"))data=research;
    else if(system.includes("Validation and Quality"))data={outcome:"pass",checks:[{criterionId:"QUALITY",result:"pass",note:"Input contract and limitations documented"}],summary:"Reviewed"};
    else data={role:agent.id,summary:"A role-specific deliverable",deliverables:agent.deliverables.map(name=>({name,content:"Concrete "+name+" for the supplied sales schema"})),
     assumptions:[],limitations:["Draft not executed"],missingInformation:[],nextSteps:[agent.handoff],evidence:["20 rows"]};
    const text=JSON.stringify(data);
    const response=provider==="openai"?{choices:[{finish_reason:"stop",message:{content:text}}]}:
     provider==="anthropic"?{content:[{type:"text",text}]}:{candidates:[{content:{parts:[{text}]}}]};
    expect(JSON.stringify(options.headers)).toContain(key);
    return new Response(JSON.stringify(response));
   });
   vi.stubGlobal("fetch",calls);
   const task=await withModelSession({demo:false,config:{provider,apiKey:key,model:"test-model"}},
    ()=>createAndRunTask({request:"Review sales quality",evidence:"Sales table has 20 rows",agent:agent.id}));
   expect(task.status).toBe("completed");
   expect(task.mode).toBe("llm");expect(task.persistence).toEqual({kind:"response"});
   const extra=!["intake","research","validation"].includes(agent.id);
   expect(task.steps).toHaveLength(extra?4:3);
   expect(calls).toHaveBeenCalledTimes(extra?4:3);
   if(extra){expect(task.specialist?.deliverables.map(d=>d.name)).toEqual([...agent.deliverables]);expect(prompts[2]).toContain(agent.mission);}
   expect(readTask(task.id)).toBeUndefined();expect(listTasks()).toHaveLength(0);
   expect(JSON.stringify(task)).not.toContain(key);
  });
 }
 it.each(AGENT_CATALOG)("runs $id in explicit demo without any network access",async agent=>{
  vi.stubEnv("OPENAI_API_KEY","owner-secret");
  const fetch=vi.fn();vi.stubGlobal("fetch",fetch);
  const task=await withModelSession({demo:true},()=>createAndRunTask({request:"Review sales pipeline",agent:agent.id}));
  expect(task.status).toBe("awaiting_human");expect(task.mode).toBe("mock");
  expect(fetch).not.toHaveBeenCalled();expect(readTask(task.id)).toBeUndefined();
 });
 it("rejects an unknown role before a model call",async()=>{
  const fetch=vi.fn();vi.stubGlobal("fetch",fetch);
  await expect(withModelSession({demo:true},()=>createAndRunTask({request:"Analyze",agent:"invented"} as never))).rejects.toThrow(/role/);
  expect(fetch).not.toHaveBeenCalled();
 });
});
