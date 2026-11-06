import {afterEach,describe,expect,it,vi} from "vitest";
import {runSpecialist} from "./roles/specialist";
import {findAgent} from "./catalog";
import {withModelSession} from "./model-context";
import type {AgentTask} from "./types";
const role=findAgent("mid-level-data-engineer")!;
const base=()=>({role:role.id,summary:"Draft SQL transformations",deliverables:role.deliverables.map(name=>({name,content:"SELECT id FROM source;"})),
 assumptions:[],limitations:["Not executed"],missingInformation:[],nextSteps:[role.handoff],evidence:["source(id integer)"]});
const task:AgentTask={id:"test",request:"Draft transformations",createdAt:"",updatedAt:"",steps:[],mode:"llm",status:"running"};
afterEach(()=>vi.unstubAllGlobals());
async function run(data:unknown){
 vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(data)}}]}))));
 return withModelSession({demo:false,config:{provider:"openai",model:"test",apiKey:"test-key-123456"}},
  ()=>runSpecialist(role.id,task,"source(id integer)"));
}
describe("specialist output contracts",()=>{
 it.each([
  ["null",()=>null],
  ["wrong role",()=>({...base(),role:"founder"})],
  ["missing deliverable",()=>({...base(),deliverables:base().deliverables.slice(1)})],
  ["duplicate deliverable",()=>({...base(),deliverables:[base().deliverables[0],base().deliverables[0],base().deliverables[2]]})],
  ["empty content",()=>({...base(),deliverables:base().deliverables.map(d=>({...d,content:""}))})],
  ["missing limitations",()=>({...base(),limitations:[]})],
  ["invalid arrays",()=>({...base(),assumptions:[{}]})],
  ["fabricated evidence",()=>({...base(),evidence:["Revenue doubled"]})]
 ] as const)("rejects %s",async(_name,build)=>{await expect(run(build())).rejects.toThrow();});
 it("preserves exact code text in valid deliverables",async()=>{
  const data=base();data.deliverables[0].content="SELECT id, '\\n' AS marker\nFROM source;";
  expect((await run(data)).deliverables[0].content).toBe(data.deliverables[0].content);
 });
});
