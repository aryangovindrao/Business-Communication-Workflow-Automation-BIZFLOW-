import { NavLink } from 'react-router-dom';
import { Sparkles, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NAV_ITEMS } from '@/routes/nav';
import { useAuthStore } from '@/store/auth-store';
import { initials } from '@/utils/format';

export function Sidebar() {
  const user = useAuthStore((s) => s.session?.user);
  const role = user?.role;

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || (role && item.roles.includes(role)),
  );

  return (
    <aside className="flex w-[88px] shrink-0 flex-col items-center rounded-[1.75rem] bg-sidebar py-4 text-sidebar-foreground">
      {/* Logo */}
      <NavLink to="/dashboard" className="flex flex-col items-center gap-1.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sidebar shadow-sm">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="text-[11px] font-bold tracking-tight">BizFlow</span>
      </NavLink>

      {/* Nav */}
      <nav className="mt-6 flex flex-1 flex-col items-center gap-1.5 overflow-y-auto scrollbar-thin">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} className="block">
            {({ isActive }) => (
              <div className="group flex w-[72px] flex-col items-center gap-1.5 py-1">
                <span
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl transition-colors',
                    isActive
                      ? 'bg-brand/20 text-brand'
                      : 'text-sidebar-foreground/55 group-hover:bg-white/10 group-hover:text-sidebar-foreground',
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium leading-none transition-colors',
                    isActive
                      ? 'text-sidebar-foreground'
                      : 'text-sidebar-foreground/45',
                  )}
                >
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: help + avatar */}
      <div className="mt-4 flex flex-col items-center gap-3">
        <button
          aria-label="Help"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sidebar-foreground/55 transition-colors hover:bg-white/10 hover:text-sidebar-foreground"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="relative">
          <Avatar className="h-10 w-10 ring-2 ring-white/15">
            <AvatarFallback className="bg-brand/20 text-brand">
              {user ? initials(user.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-sidebar" />
        </div>
      </div>
    </aside>
  );
}
