// Shared helper used by /api/chat and /api/report.
// Keeps the Gemini API key server-side only (read from process.env, never
// exposed to the browser bundle).

// Ordered fallback chain. We try GEMINI_MODEL (or gemini-1.5-flash) first,
// then walk down this list so the app never hard-fails just because a
// specific model name has been retired in a given Google AI Studio project.
const FALLBACK_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.5-flash',
];

function buildModelList(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim();
  const list = preferred ? [preferred, ...FALLBACK_MODELS] : [...FALLBACK_MODELS];
  return Array.from(new Set(list));
}

export interface GeminiResult {
  ok: boolean;
  text?: string;
  modelUsed?: string;
  error?: string;
  status?: number;
}

/**
 * Calls Gemini's generateContent endpoint, walking the fallback model list
 * until one responds successfully. Returns a normalized result object so
 * calling routes never throw — they can always send the client a clean
 * JSON response instead of a raw 500/timeout.
 */
export async function callGemini(
  systemInstruction: string,
  userPrompt: string,
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      error:
        'GEMINI_API_KEY is not configured on the server. Add it in your Vercel project\'s Environment Variables and redeploy.',
    };
  }

  const models = buildModelList();
  let lastError = 'Unknown error contacting Gemini.';

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errBody = await response.text();
        lastError = `Model "${model}" returned ${response.status}: ${errBody.slice(0, 300)}`;
        // 404 = model not available in this project/region -> try next model.
        // 429 = rate limited -> also worth trying the next model.
        // Anything else (e.g. 400 bad key format) -> stop, it won't help to retry.
        if (response.status === 404 || response.status === 429) {
          continue;
        }
        return { ok: false, status: response.status, error: lastError };
      }

      const data = await response.json();
      const text: string | undefined =
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') ?? undefined;

      if (!text) {
        lastError = `Model "${model}" returned no usable content.`;
        continue;
      }

      return { ok: true, text, modelUsed: model };
    } catch (err: any) {
      lastError = `Model "${model}" request failed: ${err?.message ?? String(err)}`;
      continue;
    }
  }

  return { ok: false, status: 502, error: lastError };
}
