import { modelSession } from "./model-context";
import type { ModelConfig } from "./model-context";
export type LlmMode = "mock" | "llm";
export class ModelError extends Error {
 constructor(public readonly code: string, message: string) { super(message); this.name = "ModelError"; }
}
export function getOpenAiKey(): string | undefined {
 const session = modelSession();
 if (session) return session.config?.apiKey;
 return process.env.OPENAI_API_KEY?.trim() || process.env.OPEN_AI_KEY?.trim() || undefined;
}
export function getLlmMode(): LlmMode { return getOpenAiKey() ? "llm" : "mock"; }
function config(): ModelConfig | undefined {
 const session = modelSession();
 if (session) return session.config;
 const key = getOpenAiKey();
 return key ? { provider:"openai",apiKey:key,model:process.env.OPENAI_MODEL || "gpt-4o-mini" } : undefined;
}
export async function completeJson<T>(params: {
 system:string; user:string; mock:T; timeoutMs?:number;
}): Promise<{data:T;mode:LlmMode;usageTokens?:number}> {
 const cfg = config();
 if (!cfg) return {data:params.mock,mode:"mock"};
 const {provider,model,apiKey} = cfg;
 const headers: Record<string,string> = {"Content-Type":"application/json"};
 let url:string;
 let body:unknown;
 const system = params.system + "\nReturn a single valid JSON object, without Markdown fences. Never claim tools were executed.";
 if (provider === "openai") {
  url="https://api.openai.com/v1/chat/completions";
  headers.Authorization="Bearer "+apiKey;
  body={model,response_format:{type:"json_object"},max_completion_tokens:4096,
   messages:[{role:"system",content:system},{role:"user",content:params.user}]};
 } else if(provider === "anthropic") {
  url="https://api.anthropic.com/v1/messages";
  headers["x-api-key"]=apiKey; headers["anthropic-version"]="2023-06-01";
  body={model,max_tokens:4096,system,messages:[{role:"user",content:params.user}]};
 } else {
  url="https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent";
  headers["x-goog-api-key"]=apiKey;
  body={systemInstruction:{parts:[{text:system}]},contents:[{role:"user",parts:[{text:params.user}]}],
   generationConfig:{responseMimeType:"application/json",maxOutputTokens:4096}};
 }
 const timeout = AbortSignal.timeout(Math.min(params.timeoutMs ?? 25000, 25000));
 const parent = modelSession()?.signal;
 const signal = parent ? AbortSignal.any([parent,timeout]) : timeout;
 try {
  const res=await fetch(url,{method:"POST",headers,body:JSON.stringify(body),signal,cache:"no-store"});
  if(!res.ok) {
   // Never surface provider response bodies: some echo credentials or user content.
   const code=res.status===401||res.status===403 ? "invalid_key" : res.status===429 ? "quota_exceeded" : "provider_error";
   throw new ModelError(code, code==="invalid_key" ? "Provider rejected the API key or model access." :
    code==="quota_exceeded" ? "Provider quota or rate limit reached. Check API billing and try later." :
    "Provider request failed (HTTP "+res.status+"). Check the model ID and provider status.");
  }
  const json=await res.json();
  let content:unknown;
  let usageTokens: number|undefined;
  if(provider==="openai") {
   if(json.choices?.[0]?.finish_reason==="length") throw new ModelError("truncated","Model output exceeded the token limit. Narrow the request.");
   content=json.choices?.[0]?.message?.content; usageTokens=json.usage?.total_tokens;
  } else if(provider==="anthropic") {
   if(json.stop_reason==="max_tokens") throw new ModelError("truncated","Model output exceeded the token limit. Narrow the request.");
   content=json.content?.filter((p:{type:string})=>p.type==="text").map((p:{text:string})=>p.text).join("");
   usageTokens=typeof json.usage?.input_tokens==="number" && typeof json.usage?.output_tokens==="number"
    ? json.usage.input_tokens+json.usage.output_tokens : undefined;
  } else {
   if(json.candidates?.[0]?.finishReason==="MAX_TOKENS") throw new ModelError("truncated","Model output exceeded the token limit. Narrow the request.");
   content=json.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join("");
   usageTokens=json.usageMetadata?.totalTokenCount;
  }
  if(typeof content!=="string" || !content.trim()) throw new ModelError("empty_output","Provider returned no usable output.");
  const safe=content.split(apiKey).join("[REDACTED]").trim().replace(/^\x60\x60\x60(?:json)?\s*/i,"").replace(/\s*\x60\x60\x60$/,"");
  let data:T;
  try { data=JSON.parse(safe) as T; } catch { throw new ModelError("invalid_json","Provider returned invalid JSON. Try a smaller request or a different model."); }
  return {data,mode:"llm",usageTokens:typeof usageTokens==="number"?usageTokens:undefined};
 } catch(error) {
  if(error instanceof ModelError) throw error;
  if(signal.aborted) throw new ModelError("timeout","Model request timed out or was cancelled. Try a smaller request.");
  throw new ModelError("network_error","Could not reach the model provider. Please retry.");
 }
}
