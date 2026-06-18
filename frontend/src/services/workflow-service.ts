import { apiRequest, MOCK_MODE, mockDelay } from '@/lib/api-client';
import type { Workflow, WorkflowRun, WorkflowStatus } from '@/types';
import { db, ORG, uid } from './mock/db';

export const workflowService = {
  async list(): Promise<Workflow[]> {
    if (MOCK_MODE) {
      return mockDelay(
        [...db.workflows].sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
        ),
      );
    }
    return apiRequest<Workflow[]>('/workflows');
  },

  async get(id: string): Promise<Workflow> {
    if (MOCK_MODE) {
      const wf = db.workflows.find((w) => w.id === id);
      if (!wf) throw new Error('Workflow not found');
      return mockDelay(wf);
    }
    return apiRequest<Workflow>(`/workflows/${id}`);
  },

  async save(workflow: Workflow): Promise<Workflow> {
    if (MOCK_MODE) {
      const idx = db.workflows.findIndex((w) => w.id === workflow.id);
      if (idx >= 0) db.workflows[idx] = workflow;
      else db.workflows.unshift(workflow);
      return mockDelay(workflow, 350);
    }
    const method = db.workflows.some((w) => w.id === workflow.id) ? 'PUT' : 'POST';
    return apiRequest<Workflow>(
      method === 'PUT' ? `/workflows/${workflow.id}` : '/workflows',
      { method, body: workflow },
    );
  },

  createDraft(name: string): Workflow {
    return {
      id: uid('wf'),
      organizationId: ORG.id,
      name,
      description: '',
      status: 'draft',
      runCount: 0,
      successRate: 0,
      createdAt: new Date().toISOString(),
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 120, y: 160 },
          data: {
            label: 'New Message',
            kind: 'trigger',
            config: { event: 'message_received' },
          },
        },
      ],
      edges: [],
    };
  },

  async setStatus(id: string, status: WorkflowStatus): Promise<Workflow> {
    if (MOCK_MODE) {
      const wf = db.workflows.find((w) => w.id === id)!;
      wf.status = status;
      return mockDelay(wf, 200);
    }
    return apiRequest<Workflow>(`/workflows/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  async listRuns(): Promise<WorkflowRun[]> {
    if (MOCK_MODE) {
      return mockDelay(
        [...db.runs].sort(
          (a, b) => +new Date(b.startedAt) - +new Date(a.startedAt),
        ),
      );
    }
    return apiRequest<WorkflowRun[]>('/workflow-runs');
  },
};
