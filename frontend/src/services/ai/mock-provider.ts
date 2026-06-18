import { INTENTS, type Intent, type Sentiment } from '@/types';
import { mockDelay } from '@/lib/api-client';
import type {
  AiProvider,
  IntentResult,
  ReplyOptions,
  SentimentResult,
} from './types';

// Keyword heuristics so the mock feels like a real zero-shot classifier.
const INTENT_KEYWORDS: Record<Intent, string[]> = {
  'Sales Inquiry': [
    'pricing',
    'price',
    'plan',
    'enterprise',
    'seats',
    'quote',
    'upgrade',
    'demo',
    'trial',
    'buy',
    'purchase',
  ],
  'Technical Support': [
    'error',
    'bug',
    '500',
    'not working',
    'broken',
    'issue',
    'webhook',
    'api',
    'fails',
    'crash',
    'help',
  ],
  'Refund Request': ['refund', 'charged twice', 'duplicate charge', 'money back', 'reimburse'],
  'Billing Issue': ['invoice', 'billing', 'vat', 'tax', 'receipt', 'charge', 'payment'],
  'Meeting Request': ['demo', 'meeting', 'call', 'schedule', 'book', 'calendar', 'walkthrough'],
  'General Inquiry': ['question', 'curious', 'wondering', 'discount', 'nonprofit', 'info'],
};

const POSITIVE = ['love', 'great', 'thanks', 'awesome', 'promising', 'excited', 'happy', 'perfect'];
const NEGATIVE = ['error', 'broken', 'urgent', 'frustrated', 'angry', 'fail', 'charged twice', 'not working', 'disappointed'];

function softmaxScores(text: string): { label: Intent; score: number }[] {
  const lower = text.toLowerCase();
  const raw = INTENTS.map((label) => {
    const hits = INTENT_KEYWORDS[label].reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0,
    );
    // base weight + keyword evidence + small noise for realism
    return { label, weight: 0.4 + hits * 1.6 + Math.random() * 0.2 };
  });
  const total = raw.reduce((a, r) => a + r.weight, 0);
  return raw
    .map((r) => ({ label: r.label, score: r.weight / total }))
    .sort((a, b) => b.score - a.score);
}

export const mockAiProvider: AiProvider = {
  name: 'mock',

  async classifyIntent(text: string): Promise<IntentResult> {
    const scores = softmaxScores(text);
    return mockDelay(
      { intent: scores[0].label, confidence: scores[0].score, scores },
      450,
    );
  },

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const lower = text.toLowerCase();
    const pos = POSITIVE.reduce((a, w) => a + (lower.includes(w) ? 1 : 0), 0);
    const neg = NEGATIVE.reduce((a, w) => a + (lower.includes(w) ? 1 : 0), 0);
    let sentiment: Sentiment = 'Neutral';
    let score = 0.5;
    if (pos > neg) {
      sentiment = 'Positive';
      score = Math.min(0.97, 0.6 + pos * 0.12);
    } else if (neg > pos) {
      sentiment = 'Negative';
      score = Math.min(0.97, 0.6 + neg * 0.12);
    }
    return mockDelay({ sentiment, score }, 350);
  },

  async generateReply(context: string, options?: ReplyOptions): Promise<string> {
    const tone = options?.tone ?? 'professional';
    const opener: Record<NonNullable<ReplyOptions['tone']>, string> = {
      professional: 'Thank you for reaching out.',
      friendly: 'Thanks so much for your message! 😊',
      concise: 'Thanks for getting in touch.',
      empathetic:
        'Thank you for flagging this — I completely understand, and I’m sorry for the trouble.',
    };
    const snippet = context.slice(0, 90).replace(/\s+/g, ' ').trim();
    const reply = [
      opener[tone],
      '',
      `I’ve reviewed your note regarding "${snippet}…" and I’m happy to help.`,
      '',
      tone === 'empathetic'
        ? 'Here’s what I’ll do right away to get this resolved, and I’ll keep you updated at every step.'
        : 'Here are the next steps, and I’ll make sure everything is handled promptly.',
      '',
      'Please let me know if there’s anything else I can clarify.',
      '',
      'Best regards,',
      'The Acme Support Team',
    ].join('\n');
    return mockDelay(reply, 900);
  },

  async summarize(text: string): Promise<string> {
    const firstSentence = text.split(/[.!?]/)[0]?.trim() ?? text.slice(0, 80);
    return mockDelay(
      `Customer summary: ${firstSentence}. Suggested priority based on tone and intent; a response is recommended within SLA.`,
      700,
    );
  },
};
