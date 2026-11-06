import { AsyncLocalStorage } from "node:async_hooks";
export type Provider = "openai" | "anthropic" | "gemini";
export interface ModelConfig { provider: Provider; apiKey: string; model: string }
export interface ModelSession { config?: ModelConfig; demo: boolean; signal?: AbortSignal }
const sessions = new AsyncLocalStorage<ModelSession>();
/** Request-local credentials: never write these into process.env, task records or persistence. */
export function withModelSession<T>(session: ModelSession, run: () => T): T {
 return sessions.run(session, run);
}
export function modelSession(): ModelSession | undefined { return sessions.getStore(); }
