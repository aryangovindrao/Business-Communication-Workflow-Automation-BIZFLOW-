import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Visual =
  | { type: 'bars'; data: number[] } // values 0..1; trailing 0s render muted
  | { type: 'dots'; filled: number; total: number };

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Signed fractional delta, e.g. 0.12 = +12%. */
  delta?: number;
  /** When true, a negative delta is good (e.g. response time). */
  invertDelta?: boolean;
  visual?: Visual;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  invertDelta = false,
  visual,
}: StatCardProps) {
  const positive = delta === undefined ? null : invertDelta ? delta < 0 : delta > 0;
  const Arrow = (delta ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground">
            <Icon className="h-[18px] w-[18px]" />
          </div>
        </div>

        <div className="mt-3 text-[2rem] font-extrabold leading-none tracking-tight">
          {value}
        </div>

        {delta !== undefined && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold',
                positive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}
            >
              <Arrow className="h-3.5 w-3.5" />
              {Math.abs(delta * 100).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}

        {visual?.type === 'bars' && (
          <div className="mt-4 flex h-9 items-end gap-1">
            {visual.data.map((v, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-full',
                  v > 0 ? 'bg-foreground' : 'bg-muted',
                )}
                style={{ height: `${Math.max(v * 100, 12)}%` }}
              />
            ))}
          </div>
        )}

        {visual?.type === 'dots' && (
          <div className="mt-4 flex items-center gap-1.5">
            {Array.from({ length: visual.total }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  i < visual.filled ? 'bg-foreground' : 'bg-muted',
                )}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
