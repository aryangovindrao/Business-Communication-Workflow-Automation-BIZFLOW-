import { INTENTS, type Intent, type Sentiment } from '@/types';
import type {
  AiProvider,
  IntentResult,
  ReplyOptions,
  SentimentResult,
} from './types';

/**
 * Local Ollama provider (fully offline, no API keys).
 * Enable with VITE_AI_PROVIDER=ollama and a running `ollama serve`.
 * Default model: llama3 (also works with mistral, phi, gemma).
 */
const BASE =
  (import.meta.env.VITE_OLLAMA_BASE_URL as string) ?? 'http://localhost:11434';
const MODEL = (import.meta.env.VITE_OLLAMA_MODEL as string) ?? 'llama3';

async function generate(prompt: string, json = false): Promise<string> {
  const res = await fetch(`${BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      ...(json ? { format: 'json' } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Ollama → ${res.status}`);
  const data = (await res.json()) as { response: string };
  return data.response;
}

export const ollamaProvider: AiProvider = {
  name: 'ollama',

  async classifyIntent(text): Promise<IntentResult> {
    const raw = await generate(
      `Classify the following customer message into exactly one of these intents: ${INTENTS.join(
        ', ',
      )}. Respond as JSON {"intent": string, "confidence": number}. Message: """${text}"""`,
      true,
    );
    let intent: Intent = 'General Inquiry';
    let confidence = 0.7;
    try {
      const parsed = JSON.parse(raw) as { intent: Intent; confidence: number };
      if (INTENTS.includes(parsed.intent)) intent = parsed.intent;
      confidence = parsed.confidence ?? confidence;
    } catch {
      /* keep defaults */
    }
    return {
      intent,
      confidence,
      scores: INTENTS.map((label) => ({
        label,
        score: label === intent ? confidence : (1 - confidence) / (INTENTS.length - 1),
      })),
    };
  },

  async analyzeSentiment(text): Promise<SentimentResult> {
    const raw = await generate(
      `Classify the sentiment of this message as Positive, Neutral, or Negative. Respond as JSON {"sentiment": string, "score": number}. Message: """${text}"""`,
      true,
    );
    let sentiment: Sentiment = 'Neutral';
    let score = 0.6;
    try {
      const parsed = JSON.parse(raw) as { sentiment: Sentiment; score: number };
      if (['Positive', 'Neutral', 'Negative'].includes(parsed.sentiment))
        sentiment = parsed.sentiment;
      score = parsed.score ?? score;
    } catch {
      /* keep defaults */
    }
    return { sentiment, score };
  },

  async generateReply(context, options?: ReplyOptions): Promise<string> {
    const tone = options?.tone ?? 'professional';
    return generate(
      `Write a ${tone} business reply to this customer message. Be helpful and concise. Message: """${context}"""`,
    );
  },

  async summarize(text): Promise<string> {
    return generate(`Summarize this conversation in 1-2 sentences: """${text}"""`);
  },
};
