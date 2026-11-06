import { NextRequest, NextResponse } from "next/server";
import { TaskInputError, validateTaskInput } from "@/lib/agents/input";
import { createAndRunTask } from "@/lib/agents/runtime";
import { requestSession } from "@/lib/agents/credentials";
import { withModelSession } from "@/lib/agents/model-context";
export const runtime="nodejs";
export const maxDuration=120;
const hits=new Map<string,{count:number;reset:number}>();
function reply(body:unknown,status:number) {
 return NextResponse.json(body,{status,headers:{"Cache-Control":"no-store, private","Referrer-Policy":"no-referrer"}});
}
export async function POST(request:NextRequest) {
 try {
  const origin=request.headers.get("origin");
  if(origin && origin!==request.nextUrl.origin) return reply({error:"Cross-origin requests are not accepted."},403);
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||request.headers.get("x-real-ip")||"unknown";
  const now=Date.now();
  for(const [key,row] of hits) if(row.reset<=now) hits.delete(key);
  if(hits.size>=10000 && !hits.has(ip)) return reply({error:"Server busy. Try again later."},429);
  const row=hits.get(ip)||{count:0,reset:now+15*60*1000};
  row.count++; hits.set(ip,row);
  if(row.count>10) return reply({error:"Too many requests. Please try again later."},429);
  let body:unknown;
  // Bound the stream before buffering so chunked/forged content lengths cannot allocate unbounded input.
  const reader=request.body?.getReader();
  if(!reader) return reply({error:"Invalid JSON body."},400);
  let size=0; const chunks:Uint8Array[]=[];
  while(true) {
   const {done,value}=await reader.read(); if(done) break;
   size+=value.byteLength;
   if(size>128000) { await reader.cancel(); return reply({error:"Request body is too large."},413); }
   chunks.push(value);
  }
  try {
   const raw=new Uint8Array(size); let offset=0;
   for(const chunk of chunks) {raw.set(chunk,offset);offset+=chunk.length;}
   body=JSON.parse(new TextDecoder().decode(raw));
  } catch {return reply({error:"Invalid JSON body."},400);}
  const input=validateTaskInput(body);
  const session=requestSession(request.headers,body as Record<string,unknown>);
  session.signal=AbortSignal.any([request.signal,AbortSignal.timeout(105000)]);
  const task=await withModelSession(session,()=>createAndRunTask(input));
  const status=task.errorCode==="invalid_key"?401:task.errorCode==="quota_exceeded"?429:task.errorCode?502:201;
  return reply(task,status);
 } catch(error) {
  if(error instanceof TaskInputError) return reply({error:error.message},400);
  return reply({error:"Task could not be completed. Please retry."},500);
 }
}
