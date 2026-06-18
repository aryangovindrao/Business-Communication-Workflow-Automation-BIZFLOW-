import { apiRequest, MOCK_MODE, mockDelay } from '@/lib/api-client';
import type { AuthSession } from '@/types';
import { ORG, USERS } from './mock/db';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  organizationName: string;
  email: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    if (MOCK_MODE) {
      const user =
        USERS.find(
          (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
        ) ?? USERS[0];
      return mockDelay(
        {
          user,
          organization: ORG,
          accessToken: `mock.access.${user.id}`,
          refreshToken: `mock.refresh.${user.id}`,
        },
        600,
      );
    }
    return apiRequest<AuthSession>('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    if (MOCK_MODE) {
      const id = Math.random().toString(36).slice(2, 10);
      return mockDelay(
        {
          user: {
            id: `usr_${id}`,
            organizationId: `org_${id}`,
            name: payload.name,
            email: payload.email,
            role: 'Admin',
            status: 'active',
          },
          organization: {
            id: `org_${id}`,
            name: payload.organizationName,
            plan: 'free',
          },
          accessToken: `mock.access.${id}`,
          refreshToken: `mock.refresh.${id}`,
        },
        700,
      );
    }
    return apiRequest<AuthSession>('/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  async forgotPassword(
    email: string,
  ): Promise<{ message: string; resetToken?: string | null }> {
    if (MOCK_MODE) {
      return mockDelay(
        {
          message:
            'If an account exists for that email, a reset link has been sent.',
        },
        500,
      );
    }
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    if (MOCK_MODE) {
      return mockDelay({ message: 'Your password has been reset.' }, 500);
    }
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    });
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    if (MOCK_MODE) return mockDelay({ accessToken: `mock.access.refreshed` });
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
  },

  async logout(): Promise<void> {
    if (MOCK_MODE) return mockDelay(undefined, 150);
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};
