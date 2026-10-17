import api from "./axios";
export type LiveConversation = { _id: string; source: "session" | "channel"; code: string; channel: string; contact: string; status: string; handledBy: string; startedAt: string; updatedAt: string; durationSec: number | null; topic: string; flagged: boolean; locationId: string };
export type LiveChannel = { channel: string; total: number; active: number; today: number; handoffs: number; needsAttention: number; avgDurationSec: number | null; connection: string };
export type LiveRequest = { _id: string; title: string; kind: string; createdAt: string; expiresAt?: string; proposal?: Record<string, unknown> };
export type LiveData = { today: string; timezone: string; updatedAt: string; window: string; sessions: LiveConversation[]; channels: LiveChannel[]; events: { _id: string; text: string; kind: string; channel: string; status: string; at: string; ref?: { model: string; id: string } }[]; appointments: { _id: string; customer: string; employee: string; time: string; service: string; status: string }[]; requests: LiveRequest[]; locations: { _id: string; name: string; city: string; active: boolean; sessions: number }[]; kpis: { active: number; handledToday: number; attention: number; teamActive: number; totalStaff: number } };
export type LiveDetail = LiveConversation & { contactDetails: { name: string; phone?: string; email?: string }; intent: string; aiNotes: string; outcome: string; transcript: { from: string; text: string; at: string; delivery?: string }[]; handover?: { reason?: string; note?: string; task_id?: string }; callControlAvailable: boolean };
export const ownerLiveApi = {
  get: (location?: string) => api.get<{ data: LiveData }>("/business/live", { params: { location } }).then(r => r.data.data),
  session: (id: string, source: string) => api.get<{ data: LiveDetail }>(`/business/live/sessions/${id}`, { params: { source } }).then(r => r.data.data),
  action: (id: string, source: string, kind: string, note: string) => api.post<{ data: { message: string; taskId?: string } }>(`/business/live/sessions/${id}/actions`, { kind, note }, { params: { source } }).then(r => r.data.data),
  decision: (id: string, decision: "approve" | "reject", reason: string) => api.post<{ data: { status?: string } }>(`/business/requests/${id}/decision`, { decision, reason }).then(r => r.data.data),
};
export const liveChannelName = (value: string) => ({ phone: "AI Phone", whatsapp: "WhatsApp", website_chat: "Website Chat", email: "Email", sms: "SMS", portal: "Customer Portal" }[value] || value);
