import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthSession, Role, User } from '@/types';

const REMEMBER_KEY = 'bizflow-remember';

function rememberEnabled(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) !== 'false';
  } catch {
    return true;
  }
}

/**
 * Choose where the session persists:
 *  - remember = true  → localStorage (survives browser restart)
 *  - remember = false → sessionStorage (cleared when the tab/browser closes)
 * Must be called *before* the session is written (i.e. before login succeeds).
 */
export function setRememberMe(remember: boolean): void {
  try {
    localStorage.setItem(REMEMBER_KEY, String(remember));
  } catch {
    /* storage unavailable — fall back to default */
  }
}

const switchingStorage = {
  getItem: (name: string) =>
    (rememberEnabled() ? localStorage : sessionStorage).getItem(name),
  setItem: (name: string, value: string) =>
    (rememberEnabled() ? localStorage : sessionStorage).setItem(name, value),
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
  /** RBAC helper — checks whether the current role is allowed. */
  hasRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isAuthenticated: false,
      setSession: (session) => set({ session, isAuthenticated: true }),
      updateUser: (patch) =>
        set((s) =>
          s.session
            ? { session: { ...s.session, user: { ...s.session.user, ...patch } } }
            : s,
        ),
      logout: () => set({ session: null, isAuthenticated: false }),
      hasRole: (roles) => {
        const role = get().session?.user.role;
        return role ? roles.includes(role) : false;
      },
    }),
    {
      name: 'bizflow-auth',
      storage: createJSONStorage(() => switchingStorage),
    },
  ),
);

/**
 * Role hierarchy for permission checks. Higher number = more privileges.
 * Admin > Manager > Agent > Viewer.
 */
export const ROLE_RANK: Record<Role, number> = {
  Admin: 4,
  Manager: 3,
  Agent: 2,
  Viewer: 1,
};

export function roleAtLeast(role: Role, min: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}
