import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Workflow as WorkflowIcon,
  Zap,
  GitBranch,
  Play,
  Pencil,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useWorkflows, useSetWorkflowStatus, useWorkflowRuns } from '@/hooks/use-workflows';
import { useAuthStore } from '@/store/auth-store';
import { durationMs, percent, timeAgo } from '@/utils/format';
import type { Workflow } from '@/types';

export function WorkflowsPage() {
  const navigate = useNavigate();
  const { data: workflows, isLoading } = useWorkflows();
  const { data: runs } = useWorkflowRuns();
  const setStatus = useSetWorkflowStatus();
  const canEdit = useAuthStore((s) => s.hasRole(['Admin', 'Manager', 'Agent']));

  return (
    <>
      <PageHeader
        title="Workflows"
        description="Automate routing, replies, and notifications with triggers, conditions, and actions."
        actions={
          <Button onClick={() => navigate('/workflows/new')} disabled={!canEdit}>
            <Plus className="h-4 w-4" /> New workflow
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))
            : workflows?.map((wf) => (
                <WorkflowCard
                  key={wf.id}
                  workflow={wf}
                  canEdit={canEdit}
                  onEdit={() => navigate(`/workflows/${wf.id}`)}
                  onToggle={(active) =>
                    setStatus.mutate({
                      id: wf.id,
                      status: active ? 'active' : 'paused',
                    })
                  }
                />
              ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
            <CardDescription>Execution history across all workflows</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Duration</TableHead>
                  <TableHead className="hidden sm:table-cell">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs?.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.workflowName}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {r.trigger}
                    </TableCell>
                    <TableCell>
                      {r.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Success
                        </span>
                      ) : r.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                          <XCircle className="h-3.5 w-3.5" /> Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5" /> Running
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {durationMs(r.durationMs)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {timeAgo(r.startedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function WorkflowCard({
  workflow,
  canEdit,
  onEdit,
  onToggle,
}: {
  workflow: Workflow;
  canEdit: boolean;
  onEdit: () => void;
  onToggle: (active: boolean) => void;
}) {
  const counts = workflow.nodes.reduce(
    (acc, n) => {
      acc[n.data.kind] += 1;
      return acc;
    },
    { trigger: 0, condition: 0, action: 0 } as Record<string, number>,
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <WorkflowIcon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{workflow.name}</CardTitle>
            <Badge
              variant={
                workflow.status === 'active'
                  ? 'success'
                  : workflow.status === 'paused'
                    ? 'warning'
                    : 'secondary'
              }
              className="mt-1 capitalize"
            >
              {workflow.status}
            </Badge>
          </div>
        </div>
        {workflow.status !== 'draft' && (
          <Switch
            checked={workflow.status === 'active'}
            onCheckedChange={onToggle}
            disabled={!canEdit}
          />
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {workflow.description || 'No description.'}
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-emerald-500" /> {counts.trigger}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5 text-amber-500" /> {counts.condition}
          </span>
          <span className="inline-flex items-center gap-1">
            <Play className="h-3.5 w-3.5 text-indigo-500" /> {counts.action}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
          <Stat label="Runs" value={String(workflow.runCount)} />
          <Stat
            label="Success"
            value={workflow.runCount ? percent(workflow.successRate, 0) : '—'}
          />
          <Stat
            label="Last run"
            value={workflow.lastRunAt ? timeAgo(workflow.lastRunAt) : 'Never'}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" /> {canEdit ? 'Edit workflow' : 'View workflow'}
        </Button>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
