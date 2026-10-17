import api from './axios';
export type CustomerWorkflowData = { name: string; company: string; email: string; phone: string; customerType: string; source: string; contactChannel: string; language: string; tags: string[]; location: string; address: string; notes: string; followUp: boolean; followUpAt: string; assignee_id: string };
export type CustomerWorkflow = { _id: string; status: string; kind: string; step: number; revision: number; data: Partial<CustomerWorkflowData>; customer_id?: string; task_id?: string; createdAt: string; updatedAt: string; completedAt?: string };
const root = '/business/operations';
export const ownerWorkflowsApi = {
  list: () => api.get<{ data: CustomerWorkflow[] }>(`${root}/workflows`).then(r => r.data.data),
  create: () => api.post<{ data: CustomerWorkflow }>(`${root}/workflows/customer`).then(r => r.data.data),
  detail: (id: string) => api.get<{ data: CustomerWorkflow }>(`${root}/workflows/${id}`).then(r => r.data.data),
  save: (workflow: CustomerWorkflow, data: CustomerWorkflowData, step: number) => api.patch<{ data: CustomerWorkflow }>(`${root}/workflows/${workflow._id}`, { revision: workflow.revision, data: { ...data, followUpAt: data.followUpAt ? new Date(data.followUpAt).toISOString() : '' }, step }).then(r => r.data.data),
  complete: (id: string) => api.post<{ data: CustomerWorkflow }>(`${root}/workflows/${id}/complete`).then(r => r.data.data),
  duplicates: (q: string) => api.get<{ data: { _id: string; name: string; email: string; phone: string }[] }>(`${root}/customers/search`, { params: { q } }).then(r => r.data.data),
  customer: (id: string) => api.get<{ data: { _id: string; name: string; email: string; phone: string; location: string; notes: string; tags: string[] } }>(`${root}/customers/${id}`).then(r => r.data.data),
};
