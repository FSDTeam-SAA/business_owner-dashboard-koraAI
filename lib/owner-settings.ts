import api from './axios';
export type SettingsValue = string | number | boolean;
export type SettingsField = { key: string; label: string; type: string; default: SettingsValue; options?: string[]; min?: number; max?: number };
export type SettingsSection = { scope: 'workspace' | 'global'; title: string; description: string; note: string; fields: SettingsField[] };
export type OwnerLocation = { _id: string; name: string; city: string; address: string; active: boolean };
export type PrivacyRequest = { _id: string; kind: string; subjectName: string; subjectEmail: string; status: string; note: string; dueAt: string; createdAt: string };
export type CustomField = { _id: string; label: string; key: string; entity: string; kind: string; options: string[]; required: boolean; archived: boolean };
export type DataJob = { _id: string; filename: string; kind: string; status: string; total: number; imported: number; createdAt: string; completedAt?: string; errors?: { row: number; field: string; message: string }[]; rows?: Record<string, string>[] };
export type OwnerSettingsData = {
  schema: Record<string, SettingsSection>; values: Record<string, Record<string, SettingsValue>>; revision: number; locationHours: Record<string, Record<string, SettingsValue>>;
  profile: { name: string; email: string; phoneNumber?: string; mfaEnabled: boolean; emailVerified: boolean; createdAt: string; profileImage?: { url?: string } };
  organization: { _id: string; name: string; legalName: string; industry: string; country: string; region: string; legal?: { vatId?: string; address?: string; signatory?: string }; locations: OwnerLocation[]; integrations: { provider: string; status: string; detail: string; connectedAt?: string }[]; aiAgents: { key: string; name: string; status: string }[] } | null;
  subscription: { status: string; billingCycle: string; currentPeriodEnd?: string; cancelAtPeriodEnd: boolean; amount: number; paymentMethod?: { brand: string; last4: string; expMonth: number; expYear: number }; plan_id?: { name: string; slug: string } } | null;
  invoices: { _id: string; invoice_no: string; issuedAt: string; dueAt?: string; total: number; currency: string; status: string; lines: { description: string; qty: number; unitPrice: number }[] }[];
  counters: { _id: string; period: string; metric: string; used: number; cost: number }[];
  usage: { _id: string; period: string; metrics: { key: string; label: string; unit: string; used: number; included: number; overageCost: number }[] }[];
  policy: { onLimit: string; monthlyCapEur: number; overageConsent: boolean } | null;
  members: { _id: string; user_id: { _id: string; name: string; email: string; mfa?: { enabled: boolean } }; role: string; status: string; permissions: string[]; locationIds: string[] }[];
  access: { _id: string; actor_id?: { name: string; email: string }; purpose: string; scope: string; status: string; expiresAt?: string }[];
  events: { _id: string; provider: string; kind: string; status: string; error?: string; createdAt: string }[];
  outbox: { _id: string; kind: string; status: string; attempts: number; nextAttemptAt?: string; error?: string }[];
  privacy: PrivacyRequest[]; fields: CustomField[]; jobs: DataJob[];
  audit: { _id: string; action: string; category?: string; section?: string; detail?: string; createdAt: string }[];
  plans: { slug: string; monthlyPrice: number; currency: string; isCustom?: boolean; checkoutPlanId?: string; limits: Record<string, number>; features: Record<string, boolean> }[];
  entitlements: { plan?: string; state: string; reason?: string; limits: Record<string, number>; features: Record<string, boolean> } | null;
  accounts: { provider: string; email: string; connectedAt: string }[]; customers: number;
  capabilities: { stripe: boolean; paidSubscription: boolean; oauthSignIn: boolean; perDeviceSessions: boolean; ownerApiKeys: boolean; outboundWebhooks: boolean; retentionWorker: boolean };
  currentSession: { signedInAt: string | null; expiresAt: string | null };
};
const root = '/business/settings';
export const ownerSettingsApi = {
  get: () => api.get(root).then(r => r.data.data as OwnerSettingsData),
  save: (section: string, values: Record<string, SettingsValue>, revision: number) => api.put(`${root}/sections/${section}`, { values, revision }).then(r => r.data.data),
  business: (body: Record<string, string>) => api.put(`${root}/business`, body).then(r => r.data.data),
  location: (body: Record<string, string | boolean>, id?: string) => (id ? api.put(`${root}/locations/${id}`, body) : api.post(`${root}/locations`, body)).then(r => r.data.data),
  hours: (id: string, values: Record<string, SettingsValue>) => api.put(`${root}/locations/${id}/hours`, { values }).then(r => r.data.data),
  privacy: (body: Record<string, string>, id?: string) => (id ? api.patch(`${root}/privacy-requests/${id}`, body) : api.post(`${root}/privacy-requests`, body)).then(r => r.data.data),
  field: (body: Omit<CustomField, '_id'>, id?: string) => (id ? api.put(`${root}/custom-fields/${id}`, body) : api.post(`${root}/custom-fields`, body)).then(r => r.data.data),
  validateImport: (filename: string, rows: Record<string, string>[], mapping: Record<string, string>) => api.post(`${root}/imports/validate`, { filename, rows, mapping }).then(r => r.data.data as DataJob),
  runImport: (id: string) => api.post(`${root}/imports/${id}/confirm`).then(r => r.data.data as DataJob),
  export: (kind: string) => api.get(`${root}/export`, { params: { kind }, responseType: 'blob' }).then(r => r.data as Blob),
  revoke: (password: string) => api.post(`${root}/security/revoke-sessions`, { password }),
  connectGmail: () => api.get('/gmail/init').then(r => r.data.data as { authUrl: string }),
  disconnectEmail: (provider: string) => api.post(`${root}/accounts/${provider}/disconnect`),
  fieldValues: (entity: string, id: string) => api.get(`${root}/records/${entity}/${id}/fields`).then(r => r.data.data as { fields: CustomField[]; values: Record<string, SettingsValue>; revision: number }),
  saveFieldValues: (entity: string, id: string, values: Record<string, SettingsValue>, revision: number) => api.put(`${root}/records/${entity}/${id}/fields`, { values, revision }).then(r => r.data.data),
  mfaSetup: () => api.post('/security/mfa/setup').then(r => r.data.data as { secret: string; uri: string }),
  mfaConfirm: (code: string) => api.post('/security/mfa/confirm', { code }),
  mfaDisable: (code: string) => api.post('/security/mfa/disable', { code }),
  billingPolicy: (body: { onLimit: string; monthlyCapEur: number; overageConsent: boolean }) => api.put('/business/billing/policy', body),
  previewPlan: (planSlug: string, operationId: string) => api.post('/business/billing/changes/preview', { planSlug, operationId }).then(r => r.data.data as { _id: string; kind: string; toPlan: string; effectiveAt: string; preview: { amountDue?: number; currency: string; blockers: { key: string; current: number; limit: number }[] } }),
  changePlan: (previewId: string) => api.post('/business/billing/changes', { previewId }).then(r => r.data.data as { status: string }),
};
export function settingsDate(value?: string | null) { return value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not recorded'; }
export function settingsMoney(value: number, currency = 'eur') { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency.toUpperCase() }).format(value); }

// RFC 4180 CSV parsing, including escaped quotes, CRLF and embedded newlines.
export function parseCustomerCsv(source: string) {
  const rows: string[][] = []; let row: string[] = [], cell = '', quoted = false;
  source = source.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === '"') { if (quoted && source[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (!quoted && c === ',') { row.push(cell); cell = ''; }
    else if (!quoted && (c === '\n' || c === '\r')) { if (c === '\r' && source[i + 1] === '\n') i++; row.push(cell); if (row.some(v => v.trim())) rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (quoted) throw new Error('A quoted value is missing its closing quote.');
  row.push(cell); if (row.some(v => v.trim())) rows.push(row);
  if (rows.length < 2) throw new Error('Add a header row and at least one customer.');
  const headers = rows.shift()!.map(v => v.trim());
  if (headers.some(v => !v || v.length > 150 || ['__proto__', 'constructor', 'prototype'].includes(v)) || new Set(headers).size !== headers.length) throw new Error('Column names must be unique and non-empty.');
  if (rows.length > 2000) throw new Error('Split your file into imports of 2,000 customers or fewer.');
  if (rows.some(r => r.length !== headers.length)) throw new Error('Each row must contain the same number of columns as the header.');
  return { headers, rows: rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]]))) };
}
