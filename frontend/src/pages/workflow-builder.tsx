import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft,
  GitBranch,
  Play,
  Save,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { nodeTypes } from '@/components/workflows/workflow-nodes';
import { useWorkflow, useSaveWorkflow } from '@/hooks/use-workflows';
import { workflowService } from '@/services/workflow-service';
import { useUiStore } from '@/store/ui-store';
import type { NodeKind, Workflow, WorkflowNodeData } from '@/types';

type FlowNode = Node<WorkflowNodeData>;

let nodeCounter = 100;
const nextId = () => `node-${nodeCounter++}`;

const DEFAULT_CONFIG: Record<NodeKind, Record<string, string>> = {
  trigger: { event: 'message_received' },
  condition: { field: 'intent', op: 'equals', value: 'Sales Inquiry' },
  action: { action: 'assign_team', team: 'Sales' },
};

function Builder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useUiStore((s) => s.theme);
  const isNew = !id;
  const { data: existing, isLoading } = useWorkflow(id);
  const save = useSaveWorkflow();

  const [meta, setMeta] = useState<Workflow | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [name, setName] = useState('Untitled workflow');

  // Seed canvas from the loaded/new workflow.
  useEffect(() => {
    const wf = isNew ? workflowService.createDraft('Untitled workflow') : existing;
    if (!wf) return;
    setMeta(wf);
    setName(wf.name);
    setNodes(wf.nodes as FlowNode[]);
    setEdges(wf.edges.map((e) => ({ id: e.id, source: e.source, target: e.target })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, isNew]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, id: `e-${nextId()}` }, eds)),
    [setEdges],
  );

  const selectedNode = useMemo(() => nodes.find((n) => n.selected), [nodes]);

  const addNode = (kind: NodeKind) => {
    const node: FlowNode = {
      id: nextId(),
      type: kind,
      position: { x: 360 + Math.random() * 120, y: 80 + Math.random() * 220 },
      data: {
        kind,
        label: kind === 'condition' ? 'New Condition' : 'New Action',
        config: { ...DEFAULT_CONFIG[kind] },
      },
    };
    setNodes((nds) => nds.concat(node));
  };

  const updateSelected = (patch: Partial<WorkflowNodeData>) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    );
  };

  const updateConfigValue = (key: string, value: string) => {
    if (!selectedNode) return;
    updateSelected({ config: { ...selectedNode.data.config, [key]: value } });
  };

  const deleteSelected = () => {
    if (!selectedNode || selectedNode.data.kind === 'trigger') return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id,
      ),
    );
  };

  const handleSave = () => {
    if (!meta) return;
    const workflow: Workflow = {
      ...meta,
      name,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.kind,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
    };
    save.mutate(workflow, { onSuccess: () => navigate('/workflows') });
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b bg-card/40 px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/workflows')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 max-w-xs font-medium"
        />
        {meta && <Badge variant="secondary" className="capitalize">{meta.status}</Badge>}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => addNode('condition')}>
            <GitBranch className="h-4 w-4" /> Add condition
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNode('action')}>
            <Play className="h-4 w-4" /> Add action
          </Button>
          <Button size="sm" onClick={handleSave} disabled={save.isPending}>
            {save.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Canvas + inspector */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            colorMode={theme}
            fitView
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ animated: true }}
          >
            <Background gap={16} />
            <Controls />
            <MiniMap pannable zoomable className="!bg-card" />
          </ReactFlow>
        </div>

        {/* Inspector */}
        <Card className="m-3 w-72 shrink-0 self-start rounded-xl">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Inspector</p>
            <p className="text-xs text-muted-foreground">
              {selectedNode ? 'Edit the selected node' : 'Select a node to edit'}
            </p>
          </div>
          {selectedNode ? (
            <div className="space-y-4 p-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Label</Label>
                <Input
                  value={selectedNode.data.label}
                  onChange={(e) => updateSelected({ label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Configuration</Label>
                {Object.entries(selectedNode.data.config).map(([k, v]) => (
                  <div key={k} className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">{k}</span>
                    <Input
                      value={v}
                      onChange={(e) => updateConfigValue(k, e.target.value)}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
              {selectedNode.data.kind !== 'trigger' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive"
                  onClick={deleteSelected}
                >
                  <Trash2 className="h-4 w-4" /> Delete node
                </Button>
              )}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              Drag from a node's right handle to another node to connect them.
              Use the buttons above to add conditions and actions.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <Builder />
    </ReactFlowProvider>
  );
}
