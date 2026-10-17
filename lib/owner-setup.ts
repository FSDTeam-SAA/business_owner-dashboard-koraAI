import api from './axios';
export type SetupSection = Record<string, string | number | boolean | string[]>;
export type SetupCheck = { key: string; label: string; passed: boolean; required: boolean; detail: string };
export type SetupData = { setup: { revision: number; step: number; sections: Record<string, SetupSection>; completedAt?: string }; facts: { organization: { _id: string; name: string; industry: string; country: string; locations: { _id: string; name: string }[]; integrations: { provider: string; status: string }[]; aiAgents: { name: string; status: string; channel: string }[] } | null; employees: number; knowledge: number; services: number; timezone: string; configurations: { channel: string; published: boolean }[] }; checks: SetupCheck[] };
export const ownerSetupApi = {
  initialize: () => api.post<{ data: { orgId?: string; requiresIdentity: boolean } }>('/business/setup/initialize').then(r => r.data.data),
  get: () => api.get<{ data: SetupData }>('/business/setup').then(r => r.data.data),
  save: (revision: number, step: number, section?: string, values?: SetupSection) => api.put('/business/setup', { revision, step, section, values }).then(r => r.data.data),
  analyze: (content: string) => api.post<{ data: { text: string } }>('/business/setup/analyze', { content }).then(r => r.data.data),
  check: () => api.post<{ data: { checks: SetupCheck[]; checkedAt: string; providerTested: boolean } }>('/business/setup/check').then(r => r.data.data),
  complete: () => api.post('/business/setup/complete').then(r => r.data.data),
};
