import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2, MailCheck, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth-service';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const mutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });

  if (mutation.isSuccess) {
    const devToken = mutation.data.resetToken;
    return (
      <div className="w-full max-w-sm space-y-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">{mutation.data.message}</p>
        </div>
        {devToken && (
          <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs">
            <p className="mb-1 font-medium text-muted-foreground">
              Dev mode — no SMTP configured. Continue to reset:
            </p>
            <Link
              to={`/reset-password?token=${devToken}`}
              className="break-all font-medium text-primary hover:underline"
            >
              /reset-password
            </Link>
          </div>
        )}
        <Button variant="outline" asChild className="w-full">
          <Link to="/login">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a link to reset it.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v.email.trim().toLowerCase()))}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            disabled={mutation.isPending}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
