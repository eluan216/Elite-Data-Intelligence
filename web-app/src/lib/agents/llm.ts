/**
 * Model access: OpenAI when a key is set, otherwise structured mock.
 * Accepts OPENAI_API_KEY (preferred) or OPEN_AI_KEY (Vercel naming variant).
 * Never hardcode keys. Browser never sees the key.
 */

export type LlmMode = "mock" | "llm";

export function getOpenAiKey(): string | undefined {
  const key =
    process.env.OPENAI_API_KEY?.trim() || process.env.OPEN_AI_KEY?.trim();
  return key || undefined;
}

export function getLlmMode(): LlmMode {
  return getOpenAiKey() ? "llm" : "mock";
}

export async function completeJson<T>(params: {
  system: string;
  user: string;
  mock: T;
}): Promise<{ data: T; mode: LlmMode; usageTokens?: number }> {
  const key = getOpenAiKey();
  if (!key) {
    return { data: params.mock, mode: "mock" };
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");
  const data = JSON.parse(content) as T;
  return { data, mode: "llm", usageTokens: json.usage?.total_tokens };
}
