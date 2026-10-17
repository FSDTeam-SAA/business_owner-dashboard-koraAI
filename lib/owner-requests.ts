import api from './axios';
import type { OperationFile } from './owner-tasks';
export type OwnerRequest = { _id: string; source: 'business' | 'employee' | 'leave'; title: string; status: string; kind: string; category: string; requester: string; requesterId?: string; reason?: string; isAi: boolean; createdAt: string; updatedAt: string; dueAt?: string; proposal?: Record<string, unknown>; result?: Record<string, unknown>; decision?: { by?: string; at?: string; reason?: string }; files?: OperationFile[]; attachments?: { url: string }[] };
export type RequestFormData = { title: string; reason: string; category: string; requesterId: string; from: string; to: string; priority: string; location_id: string; note: string; expiresAt: string };
const root = '/business/operations';
export const ownerRequestsApi = {
  list: () => api.get<{ data: { items: OwnerRequest[]; total: number } }>(`${root}/requests`).then(r => r.data.data),
  detail: (source: string, id: string) => api.get<{ data: OwnerRequest }>(`${root}/requests/${source}/${id}`).then(r => r.data.data),
  create: (data: RequestFormData) => api.post<{ data: { _id: string } }>(`${root}/requests`, { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : '' }).then(r => r.data.data),
  draft: () => api.get<{ data: { data: RequestFormData; updatedAt: string } | null }>(`${root}/request-draft`).then(r => r.data.data),
  saveDraft: (data: RequestFormData) => api.put(`${root}/request-draft`, data).then(r => r.data.data),
  decision: (item: OwnerRequest, decision: string, reason: string) => item.source === 'business' && item.kind !== 'manual' && ['approve', 'reject'].includes(decision)
    ? api.post(`/business/requests/${item._id}/decision`, { decision, reason }).then(r => r.data.data)
    : api.post(`${root}/requests/${item.source}/${item._id}/decision`, { decision, reason }).then(r => r.data.data),
};
