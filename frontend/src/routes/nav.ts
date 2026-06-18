import {
  LayoutDashboard,
  Inbox,
  Users,
  Workflow,
  BarChart3,
  Bell,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Roles allowed to see/enter this route. Empty = everyone. */
  roles?: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Inbox', path: '/inbox', icon: Inbox },
  { label: 'CRM', path: '/crm', icon: Users },
  { label: 'Workflows', path: '/workflows', icon: Workflow },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['Admin', 'Manager'],
  },
];
