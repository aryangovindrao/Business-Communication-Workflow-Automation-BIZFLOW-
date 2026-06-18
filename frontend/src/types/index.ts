// ─────────────────────────────────────────────────────────────
// Domain types — shared across the whole frontend.
// These mirror the planned FastAPI/SQLAlchemy models so that
// swapping mock services for the real API requires no UI changes.
// ─────────────────────────────────────────────────────────────

// ── Auth & tenancy ───────────────────────────────────────────
export type Role = 'Admin' | 'Manager' | 'Agent' | 'Viewer';

export const ROLES: Role[] = ['Admin', 'Manager', 'Agent', 'Viewer'];

export interface Organization {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  status: 'active' | 'invited' | 'disabled';
  lastActive?: string;
}

export interface AuthSession {
  user: User;
  organization: Organization;
  accessToken: string;
  refreshToken: string;
}

// ── Communication ────────────────────────────────────────────
export type Channel = 'email' | 'contact_form' | 'chat';

export type Intent =
  | 'Sales Inquiry'
  | 'Technical Support'
  | 'Refund Request'
  | 'Billing Issue'
  | 'Meeting Request'
  | 'General Inquiry';

export const INTENTS: Intent[] = [
  'Sales Inquiry',
  'Technical Support',
  'Refund Request',
  'Billing Issue',
  'Meeting Request',
  'General Inquiry',
];

export type Sentiment = 'Positive' | 'Neutral' | 'Negative';

export type MessageStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface ThreadEntry {
  id: string;
  authorName: string;
  authorRole: 'customer' | 'agent' | 'ai';
  body: string;
  createdAt: string;
}

export interface Message {
  id: string;
  organizationId: string;
  channel: Channel;
  fromName: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  intent: Intent;
  intentConfidence: number; // 0..1
  sentiment: Sentiment;
  sentimentScore: number; // 0..1
  status: MessageStatus;
  assigneeId?: string;
  assigneeName?: string;
  tags: string[];
  starred: boolean;
  unread: boolean;
  createdAt: string;
  thread: ThreadEntry[];
}

// ── Tickets ──────────────────────────────────────────────────
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: string;
  organizationId: string;
  subject: string;
  status: MessageStatus;
  priority: Priority;
  intent: Intent;
  assigneeName?: string;
  messageId: string;
  createdAt: string;
}

// ── CRM ──────────────────────────────────────────────────────
export type ContactType = 'lead' | 'customer';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'won'
  | 'lost';

export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
];

export type InteractionType = 'email' | 'call' | 'meeting' | 'note' | 'chat';

export interface Interaction {
  id: string;
  type: InteractionType;
  summary: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  notes?: string;
}

export interface Contact {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  type: ContactType;
  status: LeadStatus;
  value: number; // potential / lifetime value in USD
  ownerName?: string;
  avatarUrl?: string;
  createdAt: string;
  lastContactAt: string;
  interactions: Interaction[];
  meetings: Meeting[];
}

// ── Workflow engine ──────────────────────────────────────────
export type WorkflowStatus = 'active' | 'paused' | 'draft';
export type NodeKind = 'trigger' | 'condition' | 'action';

export interface WorkflowNodeData {
  label: string;
  kind: NodeKind;
  /** Free-form config: trigger type, condition expression, action params. */
  config: Record<string, string>;
  [key: string]: unknown;
}

export interface WorkflowNode {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  runCount: number;
  successRate: number; // 0..1
  createdAt: string;
  lastRunAt?: string;
}

export type RunStatus = 'success' | 'failed' | 'running';

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: RunStatus;
  trigger: string;
  startedAt: string;
  durationMs: number;
}

// ── Notifications ────────────────────────────────────────────
export type NotificationType =
  | 'new_lead'
  | 'ticket_created'
  | 'approval_required'
  | 'workflow_failed'
  | 'message_received';

export type NotificationChannel = 'in_app' | 'email' | 'slack';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  channel: NotificationChannel;
  createdAt: string;
}

// ── Analytics ────────────────────────────────────────────────
export interface KpiSummary {
  totalMessages: number;
  totalMessagesDelta: number;
  openTickets: number;
  openTicketsDelta: number;
  avgResponseMinutes: number;
  avgResponseDelta: number;
  leadConversionRate: number; // 0..1
  leadConversionDelta: number;
  workflowSuccessRate: number; // 0..1
  workflowSuccessDelta: number;
  csat: number; // 0..5
  csatDelta: number;
}

export interface TimeSeriesPoint {
  date: string;
  messages: number;
  resolved: number;
  responseMinutes: number;
}

export interface DistributionPoint {
  name: string;
  value: number;
}

export interface FunnelPoint {
  stage: string;
  value: number;
}

export interface AnalyticsData {
  kpis: KpiSummary;
  messagesOverTime: TimeSeriesPoint[];
  intentDistribution: DistributionPoint[];
  sentimentDistribution: DistributionPoint[];
  channelDistribution: DistributionPoint[];
  conversionFunnel: FunnelPoint[];
  csatTrend: { date: string; csat: number }[];
  workflowSuccessTrend: { date: string; success: number; failed: number }[];
}

// ── Generic ──────────────────────────────────────────────────
export interface Paginated<T> {
  items: T[];
  total: number;
}
