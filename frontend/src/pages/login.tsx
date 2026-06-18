import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/use-auth';
import { setRememberMe } from '@/store/auth-store';

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = ({ email, password, remember }: FormValues) => {
    setRememberMe(remember);
    login.mutate({ email: email.trim().toLowerCase(), password });
  };

  const busy = login.isPending || isSubmitting;
  const serverError = login.isError
    ? (login.error as Error)?.message || 'Unable to sign in. Please try again.'
    : null;

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Brand (mobile only — the marketing panel covers desktop) */}
      <div className="space-y-2 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">BizFlow</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Sign in to your account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your workspace.
        </p>
      </div>

      {/* Server-side error */}
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoFocus
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={busy}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-10"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password
                  ? 'password-error'
                  : capsLock
                    ? 'caps-hint'
                    : undefined
              }
              disabled={busy}
              onKeyUp={(e) => setCapsLock(e.getModifierState('CapsLock'))}
              onKeyDown={(e) => setCapsLock(e.getModifierState('CapsLock'))}
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="text-xs text-destructive">
              {errors.password.message}
            </p>
          ) : (
            capsLock && (
              <p id="caps-hint" className="text-xs text-amber-600 dark:text-amber-400">
                Caps Lock is on.
              </p>
            )
          )}
        </div>

        {/* Remember me */}
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input accent-primary"
            {...register('remember')}
          />
          <span className="text-muted-foreground">Keep me signed in</span>
        </label>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          Sign in
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By signing in you agree to our{' '}
        <a href="#" className="font-medium underline-offset-2 hover:underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="#" className="font-medium underline-offset-2 hover:underline">
          Privacy Policy
        </a>
        .
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
