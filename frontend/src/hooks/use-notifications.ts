import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { notificationService } from '@/services/notification-service';

const KEY = 'notifications';

export function useNotifications() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => notificationService.list(),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
