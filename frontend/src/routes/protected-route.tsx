import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import type { Role } from '@/types';

/** Requires an authenticated session; otherwise redirects to /login. */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/** Restricts a route subtree to specific roles (RBAC). */
export function RoleGuard({ roles }: { roles: Role[] }) {
  const role = useAuthStore((s) => s.session?.user.role);
  if (!role || !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
