import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Moon,
  Sun,
  Search,
  Settings,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUiStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useLogout } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import { initials } from '@/utils/format';

const iconBtn =
  'flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-accent';

export function Topbar() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const session = useAuthStore((s) => s.session);
  const logout = useLogout();
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  const user = session?.user;

  return (
    <header className="flex h-12 shrink-0 items-center gap-3">
      {/* Search pill */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search messages, contacts, workflows…"
          className="h-12 w-full rounded-full bg-card pl-12 pr-4 text-sm shadow-sm ring-1 ring-border outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      <button onClick={toggleTheme} aria-label="Toggle theme" className={iconBtn}>
        {theme === 'dark' ? (
          <Sun className="h-[18px] w-[18px]" />
        ) : (
          <Moon className="h-[18px] w-[18px]" />
        )}
      </button>

      <Link to="/settings" aria-label="Settings" className={iconBtn}>
        <Settings className="h-[18px] w-[18px]" />
      </Link>

      <Link to="/notifications" aria-label="Notifications" className={`${iconBtn} relative`}>
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground ring-2 ring-background">
            {unread}
          </span>
        )}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-3 shadow-sm ring-1 ring-border transition-colors hover:bg-accent">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-brand/20 text-[11px] font-bold text-brand-foreground dark:text-brand">
                {user ? initials(user.name) : '??'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:block">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-[11px] text-muted-foreground">{user?.role}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user?.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <Badge variant="secondary">{session?.organization.name}</Badge>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <UserIcon className="h-4 w-4" /> Profile &amp; Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => logout.mutate()}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
