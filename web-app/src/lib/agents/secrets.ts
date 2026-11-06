/** Redact after decoding JSON as well as before returning public task records. */
export function redactSecret<T>(value:T, secret:string):T {
 function visit(item:unknown):unknown {
  if(typeof item==="string") return item.split(secret).join("[REDACTED]");
  if(Array.isArray(item)) return item.map(visit);
  if(item && typeof item==="object") return Object.fromEntries(
   Object.entries(item).map(([key,child])=>[key.split(secret).join("[REDACTED]"),visit(child)]));
  return item;
 }
 return visit(value) as T;
}
