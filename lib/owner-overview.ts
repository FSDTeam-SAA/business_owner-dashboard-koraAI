import api from "./axios";

export type OverviewAppointment = { _id: string; date: string; startTime: string; endTime: string; customer: string; employee: string; service: string; status: string };
export type OverviewActivity = { _id: string; title: string; description: string; kind: string; at: string };
export type OwnerOverview = {
  today: string; timezone: string; weekStart: string; businessName: string; generatedAt: string;
  days: { date: string; count: number }[];
  kpis: { today: number; remaining: number; todayChange: number | null; week: number; weekChange: number | null; activeStaff: number; totalStaff: number; onLeave: number; occupancy: number | null; occupiedMinutes: number; capacityMinutes: number };
  trends: { date: string; count: number; occupancy: number | null }[];
  schedule: OverviewAppointment[]; recentActivity: OverviewActivity[]; followUpCustomers: number; teamLoad: { name: string; count: number }[];
};
export type SearchResults = { appointments: { _id: string; title: string; service: string; appointmentDate: string; startTime: string; status: string }[]; employees: { _id: string; name: string; position: string }[] };
export const ownerOverviewApi = {
  get: (weekStart?: string) => api.get<{ data: OwnerOverview }>("/business/overview", { params: weekStart ? { weekStart } : {} }).then(r => r.data.data),
  search: (q: string) => api.get<{ data: SearchResults }>("/business/overview/search", { params: { q } }).then(r => r.data.data),
  chat: (message: string, conversationId?: string) => api.post<{ data: { conversationId: string; text: string } }>("/business/overview/chat", { message, conversationId }).then(r => r.data.data),
};
export function apiError(error: unknown) { return (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Unable to load your business data. Please try again."; }
export function shiftDate(key: string, days: number) { return new Date(Date.parse(`${key}T12:00:00Z`) + days * 86400000).toISOString().slice(0, 10); }
export function dayLabel(key: string, options: Intl.DateTimeFormatOptions) { return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(new Date(`${key}T12:00:00Z`)); }
