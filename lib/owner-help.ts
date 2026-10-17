import api from './axios';
export type HelpArticle = { _id: string; title: string; summary: string; category: string; body?: string; updatedAt?: string; feedback?: boolean | null };
export type SupportTicket = { _id: string; ticket_id: string; subject: string; type: string; priority: string; status: string; createdAt: string; updatedAt: string; replies?: { _id: string; message: string; sender: string; role: string; createdAt: string }[]; attachments?: { _id: string; name: string; bytes: number }[] };
export const ownerHelpApi = {
  articles: (q: string, category: string) => api.get<{ data: { articles: HelpArticle[]; categories: string[] } }>('/business/help/articles', { params: { q, category } }).then(r => r.data.data),
  article: (key: string) => api.get<{ data: HelpArticle }>(`/business/help/articles/${key}`).then(r => r.data.data),
  feedback: (key: string, helpful: boolean) => api.post(`/business/help/articles/${key}/feedback`, { helpful }),
  tickets: (page: number, status: string) => api.get<{ data: { tickets: SupportTicket[]; stats: { open: number; resolved: number } }; meta: { total: number; pages: number } }>('/business/help/tickets', { params: { page, status, limit: 12 } }).then(r => r.data),
  ticket: (id: string) => api.get<{ data: SupportTicket }>(`/business/help/tickets/${id}`).then(r => r.data.data),
  create: (data: FormData) => api.post<{ data: { _id: string } }>('/business/help/tickets', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data),
  reply: (id: string, message: string) => api.post(`/business/help/tickets/${id}/reply`, { message }),
  attachment: (ticket: string, id: string) => api.get<Blob>(`/business/help/tickets/${ticket}/attachments/${id}`, { responseType: 'blob' }).then(r => r.data),
};
