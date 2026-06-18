import { apiRequest, MOCK_MODE, mockDelay } from '@/lib/api-client';
import type { AppNotification } from '@/types';
import { db } from './mock/db';

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    if (MOCK_MODE) {
      return mockDelay(
        [...db.notifications].sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
        ),
      );
    }
    return apiRequest<AppNotification[]>('/notifications');
  },

  async markRead(id: string): Promise<void> {
    if (MOCK_MODE) {
      const n = db.notifications.find((x) => x.id === id);
      if (n) n.read = true;
      return mockDelay(undefined, 120);
    }
    await apiRequest(`/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllRead(): Promise<void> {
    if (MOCK_MODE) {
      db.notifications.forEach((n) => (n.read = true));
      return mockDelay(undefined, 150);
    }
    await apiRequest('/notifications/read-all', { method: 'POST' });
  },
};
