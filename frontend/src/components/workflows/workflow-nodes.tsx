import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Zap, GitBranch, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NodeKind, WorkflowNodeData } from '@/types';

type FlowNode = Node<WorkflowNodeData>;

const KIND_META: Record<
  NodeKind,
  { icon: typeof Zap; ring: string; chip: string; label: string }
> = {
  trigger: {
    icon: Zap,
    ring: 'border-emerald-500/60',
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'Trigger',
  },
  condition: {
    icon: GitBranch,
    ring: 'border-amber-500/60',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: 'Condition',
  },
  action: {
    icon: Play,
    ring: 'border-indigo-500/60',
    chip: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    label: 'Action',
  },
};

function BaseNode({ data, selected }: NodeProps<FlowNode>) {
  const meta = KIND_META[data.kind];
  const Icon = meta.icon;
  const configEntries = Object.entries(data.config ?? {});

  return (
    <div
      className={cn(
        'w-56 rounded-xl border-2 bg-card shadow-sm transition-shadow',
        meta.ring,
        selected && 'shadow-lg ring-2 ring-primary/40',
      )}
    >
      {data.kind !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2.5 !w-2.5 !border-2 !border-background !bg-muted-foreground"
        />
      )}
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <div className={cn('flex h-6 w-6 items-center justify-center rounded-md', meta.chip)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {meta.label}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium leading-tight">{data.label}</p>
        {configEntries.length > 0 && (
          <dl className="mt-1.5 space-y-0.5">
            {configEntries.slice(0, 3).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 text-[11px]">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="truncate font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />
    </div>
  );
}

export const nodeTypes = {
  trigger: BaseNode,
  condition: BaseNode,
  action: BaseNode,
};
