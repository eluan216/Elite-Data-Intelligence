import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
import {POST} from "./route";
import {GET} from "./[id]/route";
import {createAndRunTask} from "@/lib/agents/runtime";
import {modelSession} from "@/lib/agents/model-context";
vi.mock("@/lib/agents/runtime",()=>({createAndRunTask:vi.fn()}));
let n=0;
function request(body:unknown,headers:Record<string,string>={}){
 return new NextRequest("https://example.com/api/agents/tasks",{method:"POST",headers:{"content-type":"application/json","x-forwarded-for":"byok-"+n++,...headers},body:JSON.stringify(body)});
}
beforeEach(()=>{vi.stubEnv("OPENAI_API_KEY","owner-key");vi.mocked(createAndRunTask).mockReset();
 vi.mocked(createAndRunTask).mockImplementation(async input=>{
  const session=modelSession();expect(session).toBeDefined();
  return {id:"private-task",createdAt:"",updatedAt:"",status:"awaiting_human",request:input.request,steps:[],mode:session?.config?"llm":"mock",persistence:{kind:"response"}};
 });
});
afterEach(()=>vi.unstubAllEnvs());
describe("public BYOK endpoint",()=>{
 it("never silently falls back to owner credentials",async()=>{
  const out=await POST(request({request:"Analyze this"}));
  expect(out.status).toBe(400);expect(createAndRunTask).not.toHaveBeenCalled();
 });
 it("passes request-local config but not credentials in task input or response",async()=>{
  const key="visitor-secret-12345";
  const out=await POST(request({request:"Analyze",provider:"openai",model:"test-model"},{"x-agent-api-key":key}));
  expect(out.status).toBe(201);expect(out.headers.get("cache-control")).toContain("no-store");
  expect(JSON.stringify(vi.mocked(createAndRunTask).mock.calls)).not.toContain(key);
  expect(await out.text()).not.toContain(key);
  expect(modelSession()).toBeUndefined();
 });
 it("isolates simultaneous visitors at the HTTP boundary",async()=>{
  const seen:string[]=[];
  vi.mocked(createAndRunTask).mockImplementation(async input=>{
   await new Promise(resolve=>setTimeout(resolve,input.request==="A"?10:1));
   seen.push(modelSession()!.config!.apiKey);
   return {id:input.request,request:input.request,createdAt:"",updatedAt:"",steps:[],mode:"llm",status:"completed"};
  });
  await Promise.all(["A","B"].map(user=>POST(request({request:user,provider:"openai",model:"test-model"},{"x-agent-api-key":user+"-private-key"}))));
  expect(seen.sort()).toEqual(["A-private-key","B-private-key"]);
 });
 it("rejects cross-origin requests",async()=>{
  expect((await POST(request({request:"Analyze",demo:true},{origin:"https://evil.example"}))).status).toBe(403);
 });
 it("rejects an oversized request body",async()=>{
  expect((await POST(request({request:"x".repeat(128001),demo:true}))).status).toBe(413);
 });
 it("does not expose task history",async()=>{
  const out=await GET();expect(out.status).toBe(410);
 });
 it("does not leak an unexpected exception",async()=>{
  vi.mocked(createAndRunTask).mockRejectedValue(new Error("secret-provider-key"));
  const out=await POST(request({request:"Analyze",demo:true}));
  expect(out.status).toBe(500);expect(await out.text()).not.toContain("secret-provider-key");
 });
});
