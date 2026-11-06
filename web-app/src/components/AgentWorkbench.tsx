"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AGENT_CATALOG, findAgent } from "@/lib/agents/catalog";
import type { AgentTask } from "@/lib/agents/types";
type Provider="openai"|"anthropic"|"gemini";
const field="mt-2 min-w-0 w-full rounded-lg border border-neutral-300 bg-white p-3 text-neutral-950";
export default function AgentWorkbench(){
 const [provider,setProvider]=useState<Provider>("openai");
 const [model,setModel]=useState("");
 const [agent,setAgent]=useState("");
 const [demo,setDemo]=useState(false);
 const [running,setRunning]=useState(false);
 const [result,setResult]=useState<AgentTask|null>(null);
 const [error,setError]=useState("");
 const [stage,setStage]=useState("");
 const keyRef=useRef<HTMLInputElement>(null);
 const controller=useRef<AbortController|null>(null);
 useEffect(()=>()=>controller.current?.abort(),[]);
 const selected=findAgent(agent);
 async function run(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setError("");setResult(null);
  const form=new FormData(event.currentTarget);
  const apiKey=keyRef.current?.value.trim()||"";
  if(!demo && !apiKey){setError("Enter your provider API key.");keyRef.current?.focus();return;}
  if(!demo && !model.trim()){setError("Enter a model ID available in your provider account.");return;}
  const abort=new AbortController();controller.current=abort;
  setRunning(true);setStage("Running Intake → Research"+(selected && !["intake","research","validation"].includes(agent)?" → "+selected.name:"")+" → Validation…");
  const body={request:String(form.get("request")||""),evidence:String(form.get("evidence")||""),
   ...(agent?{agent}:{}),demo,provider,model:model.trim()};
  if(keyRef.current)keyRef.current.value="";
  try{
   const response=await fetch("/api/agents/tasks",{method:"POST",headers:{"Content-Type":"application/json",...(!demo?{"X-Agent-Api-Key":apiKey}:{})},
    body:JSON.stringify(body),signal:abort.signal,cache:"no-store"});
   const data=await response.json();
   if(data.id){setResult(data);setStage("Run finished.");}
   else {setError(data.error||"Request failed. Please retry.");setStage("");}
  }catch{
   setError(abort.signal.aborted?"Run cancelled. In-flight provider work may still be billed.":"Connection failed. Please retry.");setStage("");
  }finally{controller.current=null;setRunning(false);}
 }
 function clear(){
  controller.current?.abort();
  if(keyRef.current)keyRef.current.value="";
  setResult(null);setError("");setStage("");
 }
 function download(){
  if(!result)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:"application/json"}));
  const a=document.createElement("a");a.href=url;a.download="agent-result-"+result.id+".json";a.click();URL.revokeObjectURL(url);
 }
 return <main className="min-h-screen bg-neutral-50 text-neutral-950">
  <header className="border-b border-neutral-200 bg-white px-6 py-5"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
   <Link href="/" className="font-semibold">Elite Data Intelligence</Link><Link href="/analyze" className="text-sm underline">CSV analyzer ↗</Link>
  </div></header>
  <div className="mx-auto max-w-6xl px-6 py-14">
   <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">Your model. Your workspace.</p>
   <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">A specialist for the work.</h1>
   <p className="mt-5 max-w-2xl text-lg text-neutral-600">Bring your API key, choose a role, and receive concrete work products with an evidence-based quality review.</p>
   <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
    <form onSubmit={run} className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
     <h2 className="text-xl font-semibold">01 / Configure your run</h2>
     <p className="mt-3 text-sm text-neutral-600">Your key is sent over HTTPS through this server to your chosen provider. The app does not save it in browser storage, task history, or GitHub. Only use a deployment you trust. Provider usage is billed to your account.</p>
     <fieldset disabled={running} className="mt-6 space-y-5">
      <div><label htmlFor="agent" className="text-sm font-semibold">Role</label>
       <select id="agent" value={agent} onChange={e=>setAgent(e.target.value)} className={field}>
        <option value="">Core workflow / Intake → Research → Validation</option>
        {AGENT_CATALOG.map(role=><option key={role.id} value={role.id}>{role.name}</option>)}
       </select>
       <p className="mt-2 text-sm text-neutral-600">{selected?.mission||"Create a brief, analyze supplied evidence, then check acceptance criteria."}</p>
      </div>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={demo} onChange={e=>{setDemo(e.target.checked);if(keyRef.current)keyRef.current.value="";}} className="mt-1"/>Try demo mode without a key. Demo outputs are templates, not completed work.</label>
      {!demo&&<><div className="grid gap-4 sm:grid-cols-2">
       <div><label htmlFor="provider" className="text-sm font-semibold">Provider</label><select id="provider" value={provider} onChange={e=>{setProvider(e.target.value as Provider);setModel("");if(keyRef.current)keyRef.current.value="";}} className={field}><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="gemini">Google Gemini</option></select></div>
       <div><label htmlFor="model" className="text-sm font-semibold">Model ID</label><input id="model" value={model} onChange={e=>setModel(e.target.value)} required maxLength={120} placeholder="Model ID from your account" autoComplete="off" className={field}/></div>
      </div>
      <div><label htmlFor="api-key" className="text-sm font-semibold">Your API key</label><input id="api-key" ref={keyRef} type="password" required maxLength={512} autoComplete="off" spellCheck={false} aria-describedby="key-help" className={field}/><p id="key-help" className="mt-2 text-xs text-neutral-600">Used for this run only. The field clears when the run starts; enter it again for another run.</p></div></>}
      <div><label htmlFor="request" className="text-sm font-semibold">What do you need?</label><textarea id="request" name="request" required maxLength={8000} rows={5} placeholder="Describe the decision, desired work product, success metric, owner, and constraints." className={field}/></div>
      <div><label htmlFor="evidence" className="text-sm font-semibold">Evidence and project context <span className="font-normal">(optional)</span></label><textarea id="evidence" name="evidence" maxLength={20000} rows={6} placeholder="Paste relevant schemas, code, logs, results, or source notes. Do not include secrets or data you are not authorized to send." className={field}/></div>
      <p className="text-xs text-neutral-600">A core run uses up to 3 model calls; a specialist run uses up to 4. Each call requests at most 4,096 output tokens. Costs depend on your provider and model. Results stay on this page until you clear or leave it.</p>
      <button type="submit" className="w-full rounded-lg bg-neutral-950 px-5 py-3 font-semibold text-white disabled:opacity-50">{running?"Working…":demo?"Run demo workflow":"Run with my key"}</button>
     </fieldset>
     {running&&<button type="button" onClick={()=>controller.current?.abort()} className="mt-4 text-sm underline">Cancel run</button>}
     <p role="status" aria-live="polite" className="mt-4 text-sm">{stage}</p>
     {error&&<p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    </form>
    <aside className="min-w-0 space-y-6">
     <section className="rounded-2xl bg-neutral-950 p-6 text-white md:p-8"><p className="text-xs uppercase tracking-widest text-neutral-400">15 callable specialist roles</p><h2 className="mt-3 text-2xl font-semibold">{selected?.name||"One accountable workflow"}</h2>
      <p className="mt-4 text-neutral-300">{selected?.mission||"Every run starts with a scoped brief and supplied-evidence research. Additional specialists produce role-specific deliverables before the quality gate."}</p>
      <h3 className="mt-6 text-sm font-semibold">You receive</h3><ul className="mt-3 space-y-2 text-sm text-neutral-300">{(selected?.deliverables||["Structured brief and missing information","Findings, assumptions, and limitations","Per-criterion quality checks"]).map(item=><li key={item}>↗ {item}</li>)}</ul>
      <p className="mt-6 border-t border-neutral-700 pt-5 text-sm text-neutral-300">{selected?.handoff||"You remain the final authority on business outcomes, releases, and external actions."}</p>
      {selected&&<a className="mt-4 inline-block text-sm underline" href={"https://github.com/eluan216/Elite-Data-Intelligence/blob/main/"+selected.source} target="_blank" rel="noreferrer">Read role definition ↗</a>}
     </section>
     <section className="rounded-2xl border border-neutral-200 bg-white p-6"><h2 className="font-semibold">Clear boundaries</h2><p className="mt-3 text-sm leading-6 text-neutral-600">Agents draft analyses, code, SQL, tests, plans, and runbooks. They do not execute code, deploy infrastructure, send messages, create bookings, or access private systems. Missing evidence goes to human review. The Founder role remains human.</p></section>
    </aside>
   </div>
   {result&&<section className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8" aria-label="Agent result">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-neutral-500">{result.mode==="mock"?"Demo result / not verified":"Model-generated result"}</p><h2 className="mt-2 text-2xl font-semibold">{result.status.replaceAll("_"," ")}</h2></div><div className="flex gap-5 text-sm"><button onClick={download} className="underline">Download JSON</button><button onClick={clear} className="underline">Clear result</button></div></div>
    {result.error&&<p role="alert" className="mt-5 text-red-800">{result.error}</p>}
    <ol className="mt-5 flex flex-wrap gap-3 text-xs">{result.steps.map(s=><li key={s.role} className="rounded-full bg-neutral-100 px-3 py-2">{findAgent(s.role)?.name||s.role}: {s.status==="passed"?"output produced":s.status}</li>)}</ol>
    {result.brief&&<article className="mt-8"><h3 className="text-xl font-semibold">{result.brief.title}</h3><p className="mt-3 whitespace-pre-wrap text-sm">{result.brief.problem}</p>{result.brief.missingInformation.length>0&&<><h4 className="mt-4 font-semibold">Information needed</h4><ul className="mt-2 list-inside list-disc text-sm">{result.brief.missingInformation.map((q,i)=><li key={i}>{q}</li>)}</ul></>}</article>}
    {result.research&&<article className="mt-8"><h3 className="text-xl font-semibold">Research</h3>{(["findings","facts","assumptions","limitations","evidence"] as const).map(group=><div key={group} className="mt-4"><h4 className="text-sm font-semibold capitalize">{group}</h4><ul className="mt-2 list-inside list-disc text-sm">{result.research![group].map((item,i)=><li key={i} className="whitespace-pre-wrap break-words">{item}</li>)}</ul></div>)}</article>}
    {result.specialist&&<article className="mt-8"><h3 className="text-xl font-semibold">{findAgent(result.specialist.role)?.name}</h3><p className="mt-3 text-sm">{result.specialist.summary}</p>{result.specialist.deliverables.map(d=><div key={d.name} className="mt-5"><h4 className="font-semibold">{d.name}</h4><pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-neutral-100 p-4 text-sm">{d.content}</pre></div>)}
     {(["assumptions","limitations","missingInformation","nextSteps"] as const).map(group=><div key={group} className="mt-4"><h4 className="text-sm font-semibold">{group==="missingInformation"?"Information needed":group==="nextSteps"?"Next steps":group}</h4><ul className="mt-2 list-inside list-disc text-sm">{result.specialist![group].map((item,i)=><li key={i}>{item}</li>)}</ul></div>)}</article>}
    {result.validation&&<article className="mt-8 border-t border-neutral-200 pt-6"><h3 className="text-xl font-semibold">Quality review / {result.validation.outcome.replaceAll("_"," ")}</h3><p className="mt-3 text-sm">{result.validation.summary}</p><ul className="mt-4 space-y-3 text-sm">{result.validation.checks.map(c=><li key={c.criterionId}><strong>{c.criterionId}: {c.result}</strong> — {c.note}</li>)}</ul></article>}
    <p className="mt-8 text-xs text-neutral-500">Public results are not saved on the server. Download what you need before leaving this page. Model-generated work requires your review.</p>
   </section>}
   <section className="mt-14"><h2 className="text-2xl font-semibold">Find your specialist</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{AGENT_CATALOG.map(role=><button key={role.id} onClick={()=>{setAgent(role.id);document.getElementById("agent")?.focus();}} disabled={running} className="rounded-xl border border-neutral-200 bg-white p-5 text-left hover:border-neutral-950 disabled:opacity-50"><span className="font-semibold">{role.name} ↗</span><span className="mt-2 block text-sm text-neutral-600">{role.mission}</span></button>)}</div></section>
  </div>
 </main>;
}
