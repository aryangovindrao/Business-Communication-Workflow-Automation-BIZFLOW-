import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  messageService,
  type MessageFilters,
} from '@/services/message-service';
import type { MessageStatus } from '@/types';

const KEY = 'messages';

export function useMessages(filters: MessageFilters = {}) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => messageService.list(filters),
  });
}

export function useMessage(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, 'detail', id],
    queryFn: () => messageService.get(id!),
    enabled: !!id,
  });
}

export function useUpdateMessageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MessageStatus }) =>
      messageService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Status updated');
    },
  });
}

export function useSendReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      messageService.sendReply(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Reply sent');
    },
  });
}

export function useReclassify() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messageService.reclassify(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success(`AI re-classified: ${res.intent} · ${res.sentiment}`);
    },
  });
}
