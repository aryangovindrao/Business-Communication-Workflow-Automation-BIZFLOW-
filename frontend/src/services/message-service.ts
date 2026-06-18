import { apiRequest, MOCK_MODE, mockDelay } from '@/lib/api-client';
import type { Channel, Intent, Message, MessageStatus, Sentiment } from '@/types';
import { ai } from './ai';
import { db, uid } from './mock/db';

export interface MessageFilters {
  status?: MessageStatus | 'all';
  channel?: Channel | 'all';
  intent?: Intent | 'all';
  search?: string;
}

export const messageService = {
  async list(filters: MessageFilters = {}): Promise<Message[]> {
    if (MOCK_MODE) {
      let items = [...db.messages].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      );
      const { status, channel, intent, search } = filters;
      if (status && status !== 'all')
        items = items.filter((m) => m.status === status);
      if (channel && channel !== 'all')
        items = items.filter((m) => m.channel === channel);
      if (intent && intent !== 'all')
        items = items.filter((m) => m.intent === intent);
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(
          (m) =>
            m.subject.toLowerCase().includes(q) ||
            m.fromName.toLowerCase().includes(q) ||
            m.body.toLowerCase().includes(q),
        );
      }
      return mockDelay(items);
    }
    return apiRequest<Message[]>('/messages', { params: filters as never });
  },

  async get(id: string): Promise<Message> {
    if (MOCK_MODE) {
      const msg = db.messages.find((m) => m.id === id);
      if (!msg) throw new Error('Message not found');
      return mockDelay(msg);
    }
    return apiRequest<Message>(`/messages/${id}`);
  },

  async updateStatus(id: string, status: MessageStatus): Promise<Message> {
    if (MOCK_MODE) {
      const msg = db.messages.find((m) => m.id === id)!;
      msg.status = status;
      return mockDelay(msg, 200);
    }
    return apiRequest<Message>(`/messages/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  async assign(id: string, assigneeId: string, assigneeName: string): Promise<Message> {
    if (MOCK_MODE) {
      const msg = db.messages.find((m) => m.id === id)!;
      msg.assigneeId = assigneeId;
      msg.assigneeName = assigneeName;
      return mockDelay(msg, 200);
    }
    return apiRequest<Message>(`/messages/${id}/assign`, {
      method: 'PATCH',
      body: { assigneeId },
    });
  },

  async markRead(id: string): Promise<void> {
    if (MOCK_MODE) {
      const msg = db.messages.find((m) => m.id === id);
      if (msg) msg.unread = false;
      return mockDelay(undefined, 80);
    }
    await apiRequest(`/messages/${id}/read`, { method: 'POST' });
  },

  async sendReply(id: string, body: string): Promise<Message> {
    if (MOCK_MODE) {
      const msg = db.messages.find((m) => m.id === id)!;
      msg.thread.push({
        id: uid('te'),
        authorName: 'You',
        authorRole: 'agent',
        body,
        createdAt: new Date().toISOString(),
      });
      msg.status = 'pending';
      return mockDelay(msg, 400);
    }
    return apiRequest<Message>(`/messages/${id}/reply`, {
      method: 'POST',
      body: { body },
    });
  },

  /** Re-run AI classification on a message (intent + sentiment). */
  async reclassify(
    id: string,
  ): Promise<{ intent: Intent; sentiment: Sentiment; confidence: number }> {
    if (MOCK_MODE) {
      const msg = db.messages.find((m) => m.id === id)!;
      const [intent, sentiment] = await Promise.all([
        ai.classifyIntent(msg.body),
        ai.analyzeSentiment(msg.body),
      ]);
      msg.intent = intent.intent;
      msg.intentConfidence = intent.confidence;
      msg.sentiment = sentiment.sentiment;
      msg.sentimentScore = sentiment.score;
      return {
        intent: intent.intent,
        sentiment: sentiment.sentiment,
        confidence: intent.confidence,
      };
    }
    // Production: server re-classifies and persists, then returns the result.
    return apiRequest<{ intent: Intent; sentiment: Sentiment; confidence: number }>(
      `/messages/${id}/reclassify`,
      { method: 'POST' },
    );
  },
};
