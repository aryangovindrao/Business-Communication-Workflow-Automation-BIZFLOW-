import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { analyticsService } from '@/services/analytics-service';
import { teamService } from '@/services/team-service';
import type { Role } from '@/types';

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsService.getAnalytics(),
  });
}

export function useTeam() {
  return useQuery({ queryKey: ['team'], queryFn: () => teamService.list() });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      teamService.updateRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] });
      toast.success('Role updated');
    },
  });
}
