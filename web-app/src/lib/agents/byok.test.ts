import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {completeJson,getLlmMode} from "./llm";
import {withModelSession} from "./model-context";
import type {ModelConfig} from "./model-context";
import {requestSession} from "./credentials";
const key="test-user-secret-123456";
const cfg=(provider:ModelConfig["provider"]="openai"):ModelConfig=>({provider,apiKey:key,model:"test-model"});
const payload={system:"Return JSON",user:"Analyze evidence",mock:{ok:false}};
const envelope=(provider:ModelConfig["provider"],data:unknown)=>{
 const text=JSON.stringify(data);
 return provider==="openai"?{choices:[{finish_reason:"stop",message:{content:text}}],usage:{total_tokens:7}}:
 provider==="anthropic"?{content:[{type:"text",text}],usage:{input_tokens:3,output_tokens:4}}:
 {candidates:[{content:{parts:[{text}]}}],usageMetadata:{totalTokenCount:7}};
};
beforeEach(()=>vi.stubEnv("OPENAI_API_KEY","owner-secret-do-not-use"));
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();vi.restoreAllMocks();});
describe("per-request provider credentials",()=>{
 it.each(["openai","anthropic","gemini"] as const)("uses %s adapter and its own auth header",async provider=>{
  const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify(envelope(provider,{ok:true}))));
  vi.stubGlobal("fetch",fetch);
  const out=await withModelSession({demo:false,config:cfg(provider)},()=>completeJson(payload));
  expect(out).toEqual({data:{ok:true},mode:"llm",usageTokens:7});
  const [url,options]=fetch.mock.calls[0];
  expect(url).not.toContain(key);expect(options.body).not.toContain(key);
  expect(JSON.stringify(options.headers)).toContain(key);
  expect(JSON.stringify(options)).not.toContain("owner-secret-do-not-use");
  expect(options.signal).toBeInstanceOf(AbortSignal);
 });
 it("never uses the owner's key in demo mode",async()=>{
  const fetch=vi.fn();vi.stubGlobal("fetch",fetch);
  const out=await withModelSession({demo:true},()=>completeJson(payload));
  expect(out.mode).toBe("mock");expect(fetch).not.toHaveBeenCalled();
 });
 it("isolates interleaved user credentials and restores context",async()=>{
  const auth:string[]=[];
  vi.stubGlobal("fetch",vi.fn(async(_url,options)=>{
   auth.push(options.headers.Authorization);
   await new Promise(resolve=>setTimeout(resolve,options.headers.Authorization.includes("alice")?10:1));
   return new Response(JSON.stringify(envelope("openai",{ok:true})));
  }));
  await Promise.all(["alice","bob"].map(user=>withModelSession({demo:false,config:{...cfg(),apiKey:user+"-private-key"}},async()=>{
   await Promise.resolve();expect(getLlmMode()).toBe("llm");return completeJson(payload);
  })));
  expect(auth.sort()).toEqual(["Bearer alice-private-key","Bearer bob-private-key"]);
 });
 it.each([401,403,429,500])("sanitizes provider HTTP %i errors",async status=>{
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response("echo "+key,{status})));
  await expect(withModelSession({demo:false,config:cfg()},()=>completeJson(payload))).rejects.not.toThrow(key);
 });
 it("redacts the key if a provider echoes it in a model response",async()=>{
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(JSON.stringify(envelope("openai",{ok:key})))));
  const out=await withModelSession({demo:false,config:cfg()},()=>completeJson(payload));
  expect(JSON.stringify(out)).not.toContain(key);
 });
 it.each(["bad-json","empty","truncated"])("rejects %s output",async kind=>{
  const body=kind==="empty"?{choices:[]}:{choices:[{finish_reason:kind==="truncated"?"length":"stop",message:{content:"not-json"}}]};
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(JSON.stringify(body))));
  await expect(withModelSession({demo:false,config:cfg()},()=>completeJson(payload))).rejects.toThrow();
 });
 it("sanitizes a network exception containing credentials",async()=>{
  vi.stubGlobal("fetch",vi.fn().mockRejectedValue(new Error(key)));
  await expect(withModelSession({demo:false,config:cfg()},()=>completeJson(payload))).rejects.toThrow("Could not reach");
 });
 it("aborts provider requests at the configured deadline",async()=>{
  vi.stubGlobal("fetch",vi.fn((_url,options)=>new Promise((_resolve,reject)=>{
   options.signal.addEventListener("abort",()=>reject(new Error(key)),{once:true});
  })));
  await expect(withModelSession({demo:false,config:cfg()},()=>completeJson({...payload,timeoutMs:10}))).rejects.toThrow("timed out");
 });
 it("requires an explicit key or demo choice",()=>{
  expect(()=>requestSession(new Headers(),{})).toThrow(/key/);
  expect(()=>requestSession(new Headers(),{demo:true})).not.toThrow();
 });
 it.each([{provider:"other",model:"test"},{provider:"openai",model:"https://evil.example"},
  {provider:"openai",model:"test",demo:true}])("rejects unsafe configuration %j",body=>{
   expect(()=>requestSession(new Headers({"x-agent-api-key":key}),body)).toThrow();
 });
});
