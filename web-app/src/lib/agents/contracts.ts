export function record(value: unknown): value is Record<string, unknown> {
 return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function text(value: unknown): value is string {
 return typeof value === "string" && value.trim().length > 0;
}
export function strings(value: unknown): value is string[] {
 return Array.isArray(value) && value.every(text);
}
export function invalid(role: string): never {
 throw new Error(role + " returned an invalid output contract");
}
