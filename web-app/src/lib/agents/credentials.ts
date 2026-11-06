import { TaskInputError } from "./input";
import type { ModelSession, Provider } from "./model-context";
/** All public runs must explicitly select demo or bring their own key. No environment fallback. */
export function requestSession(headers:Headers, body:Record<string,unknown>):ModelSession {
 const key=headers.get("x-agent-api-key")?.trim();
 if (body.demo === true) {
  if(key) throw new TaskInputError("Remove the API key before starting a demo run.");
  return {demo:true};
 }
 if(body.demo!==undefined && body.demo!==false) throw new TaskInputError("Demo must be a boolean.");
 if(!key) throw new TaskInputError("Provide your provider API key, or explicitly choose demo mode.");
 if(key.length<10 || key.length>512 || !/^[\x21-\x7e]+$/.test(key)) throw new TaskInputError("API key format is invalid.");
 if(!["openai","anthropic","gemini"].includes(String(body.provider))) throw new TaskInputError("Choose OpenAI, Anthropic, or Gemini.");
 if(typeof body.model!=="string" || !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,119}$/.test(body.model)) throw new TaskInputError("Provide a valid model ID from your provider account.");
 return {demo:false,config:{provider:body.provider as Provider,model:body.model,apiKey:key}};
}
