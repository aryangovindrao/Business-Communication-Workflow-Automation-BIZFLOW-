import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  contactService,
  type ContactFilters,
} from '@/services/contact-service';
import type { Contact, LeadStatus } from '@/types';

const KEY = 'contacts';

export function useContacts(filters: ContactFilters = {}) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => contactService.list(filters),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      contactService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Lead status updated');
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      input: Pick<Contact, 'name' | 'email' | 'company'> & Partial<Contact>,
    ) => contactService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Contact created');
    },
  });
}
