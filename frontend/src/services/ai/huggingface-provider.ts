import { INTENTS, type Intent, type Sentiment } from '@/types';
import type {
  AiProvider,
  IntentResult,
  ReplyOptions,
  SentimentResult,
} from './types';

/**
 * Hugging Face Inference API provider (free tier).
 *
 * NOTE: In production this runs server-side (FastAPI) so the HF token is
 * never exposed to the browser. It is implemented here so the frontend can
 * also talk to HF directly during local demos when VITE_AI_PROVIDER=huggingface.
 * Falls back gracefully; the mock provider is the safe default.
 *
 * Models (all free):
 *   intent     → facebook/bart-large-mnli           (zero-shot)
 *   sentiment  → distilbert-base-uncased-finetuned-sst-2-english
 *   summary    → facebook/bart-large-cnn
 */
const HF_BASE = 'https://api-inference.huggingface.co/models';
const TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;

const MODELS = {
  intent: import.meta.env.VITE_HF_MODEL_INTENT ?? 'facebook/bart-large-mnli',
  sentiment:
    import.meta.env.VITE_HF_MODEL_SENTIMENT ??
    'distilbert-base-uncased-finetuned-sst-2-english',
  summary: import.meta.env.VITE_HF_MODEL_SUMMARY ?? 'facebook/bart-large-cnn',
};

async function hf<T>(model: string, payload: unknown): Promise<T> {
  const res = await fetch(`${HF_BASE}/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HF ${model} → ${res.status}`);
  return (await res.json()) as T;
}

export const huggingFaceProvider: AiProvider = {
  name: 'huggingface',

  async classifyIntent(text): Promise<IntentResult> {
    const out = await hf<{ labels: string[]; scores: number[] }>(MODELS.intent, {
      inputs: text,
      parameters: { candidate_labels: INTENTS },
    });
    const scores = out.labels.map((label, i) => ({
      label: label as Intent,
      score: out.scores[i],
    }));
    return { intent: scores[0].label, confidence: scores[0].score, scores };
  },

  async analyzeSentiment(text): Promise<SentimentResult> {
    const out = await hf<{ label: string; score: number }[][]>(
      MODELS.sentiment,
      { inputs: text },
    );
    const top = out[0]?.[0];
    const label = (top?.label ?? 'NEUTRAL').toUpperCase();
    const sentiment: Sentiment =
      label === 'POSITIVE' ? 'Positive' : label === 'NEGATIVE' ? 'Negative' : 'Neutral';
    return { sentiment, score: top?.score ?? 0.5 };
  },

  async generateReply(context, options?: ReplyOptions): Promise<string> {
    // Reply generation is best handled by an instruct model server-side;
    // here we summarize as a lightweight stand-in.
    const summary = await this.summarize(context);
    const tone = options?.tone ?? 'professional';
    return `Thank you for reaching out. ${summary}\n\n(Generated via Hugging Face, tone: ${tone}.)`;
  },

  async summarize(text): Promise<string> {
    const out = await hf<{ summary_text: string }[]>(MODELS.summary, {
      inputs: text,
    });
    return out[0]?.summary_text ?? text.slice(0, 160);
  },
};
