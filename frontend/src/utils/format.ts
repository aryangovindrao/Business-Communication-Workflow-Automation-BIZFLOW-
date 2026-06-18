import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

/** "3h ago", "2d ago" */
export function timeAgo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

/** Smart, compact timestamp used in lists. */
export function smartDate(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return format(d, 'p'); // 3:42 PM
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

export function fullDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy 'at' p");
}

export function currency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function percent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function durationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
