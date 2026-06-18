import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowService } from '@/services/workflow-service';
import type { Workflow, WorkflowStatus } from '@/types';

const KEY = 'workflows';

export function useWorkflows() {
  return useQuery({ queryKey: [KEY], queryFn: () => workflowService.list() });
}

export function useWorkflow(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => workflowService.get(id!),
    enabled: !!id,
  });
}

export function useWorkflowRuns() {
  return useQuery({
    queryKey: [KEY, 'runs'],
    queryFn: () => workflowService.listRuns(),
  });
}

export function useSaveWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (wf: Workflow) => workflowService.save(wf),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Workflow saved');
    },
  });
}

export function useSetWorkflowStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkflowStatus }) =>
      workflowService.setStatus(id, status),
    onSuccess: (wf) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success(`Workflow ${wf.status}`);
    },
  });
}
