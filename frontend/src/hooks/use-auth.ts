import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  authService,
  type LoginPayload,
  type RegisterPayload,
} from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';

interface FromState {
  from?: { pathname?: string };
}

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (session) => {
      setSession(session);
      toast.success(`Welcome back, ${session.user.name.split(' ')[0]}`);
      // Return the user to the page they originally requested, if any.
      const from = (location.state as FromState | null)?.from?.pathname;
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
    },
    // Errors are surfaced inline on the sign-in form (see LoginPage).
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (session) => {
      setSession(session);
      toast.success(`Welcome to BizFlow, ${session.user.name.split(' ')[0]}`);
      navigate('/dashboard', { replace: true });
    },
    // Errors are surfaced inline on the sign-up form (see SignUpPage).
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      navigate('/login', { replace: true });
    },
  });
}
