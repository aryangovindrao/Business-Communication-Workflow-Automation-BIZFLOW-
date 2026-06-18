import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / marketing panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 60%, white 0, transparent 35%)',
          }}
        />
        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">BizFlow</span>
        </div>
        <div className="relative space-y-4">
          <h1 className="text-3xl font-bold leading-tight">
            AI-powered business
            <br />
            communication automation
          </h1>
          <p className="max-w-md text-primary-foreground/80">
            Classify every message, trigger the right workflow, draft replies,
            and keep your CRM in sync — automatically.
          </p>
          <ul className="space-y-2 text-sm text-primary-foreground/90">
            <li>• Intent detection &amp; sentiment analysis</li>
            <li>• Drag-and-drop workflow engine</li>
            <li>• Unified inbox across email, forms &amp; chat</li>
          </ul>
        </div>
        <div className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} BizFlow. Multi-tenant SaaS demo.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <Outlet />
      </div>
    </div>
  );
}
