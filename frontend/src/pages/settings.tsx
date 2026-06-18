import { useState } from 'react';
import {
  Mail,
  Slack,
  MessageSquareText,
  Phone,
  Sparkles,
  Moon,
  Sun,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';
import { useTeam, useUpdateUserRole } from '@/hooks/use-analytics';
import { aiProviderName } from '@/services/ai';
import { initials } from '@/utils/format';
import { ROLES, type Role } from '@/types';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const session = useAuthStore((s) => s.session);
  const updateUser = useAuthStore((s) => s.updateUser);
  const isAdmin = useAuthStore((s) => s.hasRole(['Admin']));
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? '');

  return (
    <>
      <PageHeader title="Settings" description="Manage your account, team, and integrations." />

      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/15 text-lg text-primary">
                      {user ? initials(user.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <Badge variant="secondary">{user?.role}</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email ?? ''} readOnly />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    updateUser({ name });
                    toast.success('Profile updated');
                  }}
                >
                  Save changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization */}
          <TabsContent value="organization">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Tenant-level settings (multi-tenant by org_id).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Organization name</Label>
                    <Input defaultValue={session?.organization.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <div className="flex h-9 items-center">
                      <Badge className="capitalize">{session?.organization.plan}</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Organization ID</Label>
                  <Input value={session?.organization.id} readOnly className="font-mono text-xs" />
                </div>
                <Button onClick={() => toast.success('Organization saved')}>Save</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team">
            <TeamPanel isAdmin={isAdmin} currentUserId={user?.id} />
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <IntegrationCard icon={Mail} name="Gmail" description="Send & receive email via Gmail API / SMTP." connected />
              <IntegrationCard icon={Mail} name="Outlook" description="Microsoft 365 email integration." />
              <IntegrationCard icon={Slack} name="Slack" description="Post notifications via incoming webhooks." connected />
              <IntegrationCard icon={MessageSquareText} name="Chat Widget" description="Embeddable website chat widget." connected />
              <IntegrationCard icon={Phone} name="Twilio SMS" description="SMS notifications (free trial)." />
            </div>
          </TabsContent>

          {/* AI */}
          <TabsContent value="ai">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Configuration
                </CardTitle>
                <CardDescription>
                  Provider-agnostic AI layer. Active provider:{' '}
                  <Badge variant="secondary" className="ml-1">{aiProviderName}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select defaultValue={aiProviderName}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mock">Mock (offline demo)</SelectItem>
                      <SelectItem value="huggingface">Hugging Face Inference API</SelectItem>
                      <SelectItem value="ollama">Ollama (local)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Set <code>VITE_AI_PROVIDER</code> and disable mock mode to switch providers.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ModelField label="Intent (zero-shot)" value="facebook/bart-large-mnli" />
                  <ModelField label="Sentiment" value="distilbert-sst-2-english" />
                  <ModelField label="Summarization" value="facebook/bart-large-cnn" />
                  <ModelField label="Ollama model" value="llama3" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance">
            <AppearancePanel />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function TeamPanel({
  isAdmin,
  currentUserId,
}: {
  isAdmin: boolean;
  currentUserId?: string;
}) {
  const { data: team } = useTeam();
  const updateRole = useUpdateUserRole();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team & Roles</CardTitle>
        <CardDescription>
          {isAdmin
            ? 'Manage role-based access control for your organization.'
            : 'Only Admins can change roles.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team?.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{initials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {u.name}
                        {u.id === currentUserId && (
                          <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    disabled={!isAdmin}
                    onValueChange={(v) => updateRole.mutate({ id: u.id, role: v as Role })}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function IntegrationCard({
  icon: Icon,
  name,
  description,
  connected = false,
}: {
  icon: LucideIcon;
  name: string;
  description: string;
  connected?: boolean;
}) {
  const [on, setOn] = useState(connected);
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{name}</p>
            {on && (
              <Badge variant="success" className="gap-1">
                <Check className="h-3 w-3" /> Connected
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch
          checked={on}
          onCheckedChange={(v) => {
            setOn(v);
            toast.success(`${name} ${v ? 'connected' : 'disconnected'}`);
          }}
        />
      </CardContent>
    </Card>
  );
}

function ModelField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} readOnly className="font-mono text-xs" />
    </div>
  );
}

function AppearancePanel() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how BizFlow looks for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors',
                theme === t ? 'border-primary' : 'border-border hover:border-primary/40',
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                {t === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-medium capitalize">{t}</p>
                <p className="text-xs text-muted-foreground">
                  {t === 'light' ? 'Bright and clean' : 'Easy on the eyes'}
                </p>
              </div>
              {theme === t && <Check className="ml-auto h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
