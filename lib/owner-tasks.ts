import api from './axios';
export type OperationsContext = { ownerId: string; timezone: string; staff: { _id: string; name: string; role: string }[]; locations: { _id: string; name: string }[] };
export type OperationFile = { _id: string; filename: string; bytes: number; createdAt: string };
export type TaskDetail = { priority: string; repeat: string; team?: string; checklist: { _id?: string; title: string; completed: boolean }[]; dependsOn: string[]; nextTask_id?: string; comments?: { text: string; author: string; at: string }[] };
export type OwnerTask = { _id: string; title: string; description?: string; assignee_id?: string; location_id?: string; status: string; dueAt?: string; source: string; createdBy?: string; createdAt: string; updatedAt: string; details: TaskDetail; attachments?: OperationFile[]; history?: { actor_id: string; at: string; status: string; reason: string }[] };
export type TaskFormData = { title: string; description: string; assignee_id: string; location_id: string; dueAt: string; priority: string; team: string; repeat: string; checklist: { title: string; completed: boolean }[]; dependsOn: string[] };
export type TaskTemplate = { _id: string; title: string; data: TaskFormData };
const root = '/business/operations';
export const ownerTasksApi = {
  context: () => api.get<{ data: OperationsContext }>(`${root}/context`).then(r => r.data.data),
  list: () => api.get<{ data: { items: OwnerTask[]; templates: TaskTemplate[]; total: number } }>(`${root}/tasks`).then(r => r.data.data),
  detail: (id: string) => api.get<{ data: OwnerTask }>(`${root}/tasks/${id}`).then(r => r.data.data),
  create: (data: TaskFormData) => api.post<{ data: OwnerTask }>(`${root}/tasks`, { ...data, dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : '' }).then(r => r.data.data),
  update: (id: string, data: TaskFormData) => api.patch<{ data: OwnerTask }>(`${root}/tasks/${id}`, { ...data, dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : '' }).then(r => r.data.data),
  template: (data: TaskFormData) => api.post(`${root}/tasks/templates`, data).then(r => r.data.data),
  status: (id: string, status: string) => api.post(`${root}/tasks/${id}/status`, { status }).then(r => r.data.data),
  checklist: (id: string, itemId: string, completed: boolean) => api.patch(`${root}/tasks/${id}/checklist`, { itemId, completed }).then(r => r.data.data),
  comment: (id: string, text: string) => api.post(`${root}/tasks/${id}/comments`, { text }).then(r => r.data.data),
  upload: (entity: 'task' | 'request', id: string, file: File) => { const data = new FormData(); data.append('file', file); return api.post(`${root}/assets`, data, { params: { entity, id }, headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data); },
  download: async (file: OperationFile) => { const result = await api.get(`${root}/assets/${file._id}`, { responseType: 'blob' }); const url = URL.createObjectURL(result.data); const link = document.createElement('a'); link.href = url; link.download = file.filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); },
};
export const localDateKey = (value: Date | string) => { const d = new Date(value); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const operationDate = (value?: string, withTime = true) => value ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) }) : 'No due date';
export const prettyStatus = (value: string) => value.replaceAll('_', ' ').replace(/^./, s => s.toUpperCase());
export const localDateTime = (value?: string) => { if (!value) return ''; const d = new Date(value); return `${localDateKey(d)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
