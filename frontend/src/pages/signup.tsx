import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Eye, EyeOff, Loader2, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/hooks/use-auth';
import { setRememberMe } from '@/store/auth-store';

const schema = z
  .object({
    name: z.string().min(1, 'Your name is required').max(120),
    organizationName: z
      .string()
      .min(1, 'Company / workspace name is required')
      .max(120),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms to continue' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export function SignUpPage() {
  const register_ = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      organizationName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
    },
  });

  const onSubmit = (values: FormValues) => {
    setRememberMe(true);
    register_.mutate({
      name: values.name.trim(),
      organizationName: values.organizationName.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });
  };

  const busy = register_.isPending;
  const serverError = register_.isError
    ? (register_.error as Error)?.message ||
      'Unable to create your account. Please try again.'
    : null;

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">BizFlow</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Set up your workspace in seconds. You'll be its first admin.
        </p>
      </div>

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
        <Field label="Full name" id="name" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            autoFocus
            placeholder="Jane Doe"
            aria-invalid={!!errors.name}
            disabled={busy}
            {...register('name')}
          />
        </Field>

        <Field
          label="Company / workspace"
          id="organizationName"
          error={errors.organizationName?.message}
        >
          <Input
            id="organizationName"
            autoComplete="organization"
            placeholder="Acme Inc."
            aria-invalid={!!errors.organizationName}
            disabled={busy}
            {...register('organizationName')}
          />
        </Field>

        <Field label="Work email" id="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            disabled={busy}
            {...register('email')}
          />
        </Field>

        <Field label="Password" id="password" error={errors.password?.message}>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="pr-10"
              aria-invalid={!!errors.password}
              disabled={busy}
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Field
          label="Confirm password"
          id="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={!!errors.confirmPassword}
            disabled={busy}
            {...register('confirmPassword')}
          />
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              disabled={busy}
              {...register('acceptTerms')}
            />
            <span className="text-muted-foreground">
              I agree to the{' '}
              <a href="#" className="font-medium text-foreground hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-foreground hover:underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-xs text-destructive">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
