import { apiRequest, MOCK_MODE, mockDelay } from '@/lib/api-client';
import type { Contact, ContactType, LeadStatus } from '@/types';
import { db, ORG, uid } from './mock/db';

export interface ContactFilters {
  type?: ContactType | 'all';
  status?: LeadStatus | 'all';
  search?: string;
}

export const contactService = {
  async list(filters: ContactFilters = {}): Promise<Contact[]> {
    if (MOCK_MODE) {
      let items = [...db.contacts].sort(
        (a, b) => +new Date(b.lastContactAt) - +new Date(a.lastContactAt),
      );
      const { type, status, search } = filters;
      if (type && type !== 'all') items = items.filter((c) => c.type === type);
      if (status && status !== 'all')
        items = items.filter((c) => c.status === status);
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q),
        );
      }
      return mockDelay(items);
    }
    return apiRequest<Contact[]>('/contacts', { params: filters as never });
  },

  async get(id: string): Promise<Contact> {
    if (MOCK_MODE) {
      const c = db.contacts.find((x) => x.id === id);
      if (!c) throw new Error('Contact not found');
      return mockDelay(c);
    }
    return apiRequest<Contact>(`/contacts/${id}`);
  },

  async updateStatus(id: string, status: LeadStatus): Promise<Contact> {
    if (MOCK_MODE) {
      const c = db.contacts.find((x) => x.id === id)!;
      c.status = status;
      if (status === 'won') c.type = 'customer';
      return mockDelay(c, 200);
    }
    return apiRequest<Contact>(`/contacts/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  async create(input: Pick<Contact, 'name' | 'email' | 'company'> & Partial<Contact>): Promise<Contact> {
    if (MOCK_MODE) {
      const contact: Contact = {
        id: uid('con'),
        organizationId: ORG.id,
        name: input.name,
        email: input.email,
        company: input.company,
        phone: input.phone,
        type: input.type ?? 'lead',
        status: input.status ?? 'new',
        value: input.value ?? 0,
        ownerName: input.ownerName,
        createdAt: new Date().toISOString(),
        lastContactAt: new Date().toISOString(),
        interactions: [],
        meetings: [],
      };
      db.contacts.unshift(contact);
      return mockDelay(contact, 300);
    }
    return apiRequest<Contact>('/contacts', { method: 'POST', body: input });
  },
};
