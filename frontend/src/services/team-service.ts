import { apiRequest, MOCK_MODE, mockDelay } from '@/lib/api-client';
import type { Role, User } from '@/types';
import { db } from './mock/db';

export const teamService = {
  async list(): Promise<User[]> {
    if (MOCK_MODE) return mockDelay([...db.users]);
    return apiRequest<User[]>('/users');
  },

  async updateRole(id: string, role: Role): Promise<User> {
    if (MOCK_MODE) {
      const u = db.users.find((x) => x.id === id)!;
      u.role = role;
      return mockDelay(u, 200);
    }
    return apiRequest<User>(`/users/${id}/role`, {
      method: 'PATCH',
      body: { role },
    });
  },
};
