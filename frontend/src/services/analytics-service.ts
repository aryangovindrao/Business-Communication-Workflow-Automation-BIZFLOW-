import { apiRequest, MOCK_MODE, mockDelay } from '@/lib/api-client';
import type {
  AnalyticsData,
  DistributionPoint,
  Intent,
  TimeSeriesPoint,
} from '@/types';
import { INTENTS } from '@/types';
import { db } from './mock/db';
import { format, subDays } from 'date-fns';

function buildSeries(days: number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const base = 40 + Math.round(Math.sin(i / 2) * 12) + Math.round(Math.random() * 18);
    const resolved = Math.round(base * (0.7 + Math.random() * 0.2));
    points.push({
      date: format(date, 'MMM d'),
      messages: base,
      resolved,
      responseMinutes: Math.round(18 + Math.sin(i) * 6 + Math.random() * 8),
    });
  }
  return points;
}

function intentDistribution(): DistributionPoint[] {
  const counts = new Map<Intent, number>();
  INTENTS.forEach((i) => counts.set(i, 0));
  db.messages.forEach((m) => counts.set(m.intent, (counts.get(m.intent) ?? 0) + 1));
  // Pad with synthetic volume so the chart looks representative.
  const pad: Record<Intent, number> = {
    'Sales Inquiry': 86,
    'Technical Support': 64,
    'Refund Request': 22,
    'Billing Issue': 38,
    'Meeting Request': 41,
    'General Inquiry': 53,
  };
  return INTENTS.map((name) => ({
    name,
    value: (counts.get(name) ?? 0) + pad[name],
  }));
}

export const analyticsService = {
  async getAnalytics(): Promise<AnalyticsData> {
    if (MOCK_MODE) {
      const openTickets = db.messages.filter(
        (m) => m.status === 'open' || m.status === 'pending',
      ).length;
      const series = buildSeries(14);
      const totalMessages = series.reduce((a, p) => a + p.messages, 0);

      const data: AnalyticsData = {
        kpis: {
          totalMessages,
          totalMessagesDelta: 0.123,
          openTickets,
          openTicketsDelta: -0.06,
          avgResponseMinutes: 21,
          avgResponseDelta: -0.18,
          leadConversionRate: 0.34,
          leadConversionDelta: 0.05,
          workflowSuccessRate: 0.962,
          workflowSuccessDelta: 0.012,
          csat: 4.6,
          csatDelta: 0.2,
        },
        messagesOverTime: series,
        intentDistribution: intentDistribution(),
        sentimentDistribution: [
          { name: 'Positive', value: 58 },
          { name: 'Neutral', value: 27 },
          { name: 'Negative', value: 15 },
        ],
        channelDistribution: [
          { name: 'Email', value: 62 },
          { name: 'Contact Form', value: 21 },
          { name: 'Chat', value: 17 },
        ],
        conversionFunnel: [
          { stage: 'New', value: 320 },
          { stage: 'Contacted', value: 214 },
          { stage: 'Qualified', value: 138 },
          { stage: 'Proposal', value: 76 },
          { stage: 'Won', value: 48 },
        ],
        csatTrend: series.map((p) => ({
          date: p.date,
          csat: Number((4.2 + Math.random() * 0.7).toFixed(2)),
        })),
        workflowSuccessTrend: series.map((p) => ({
          date: p.date,
          success: Math.round(p.messages * 0.9),
          failed: Math.round(p.messages * 0.06),
        })),
      };
      return mockDelay(data, 500);
    }
    return apiRequest<AnalyticsData>('/analytics/summary');
  },
};
