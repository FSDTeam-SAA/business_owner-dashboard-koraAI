import api from './axios';
export type CalendarAppointment = { _id: string; date: string; startTime: string; endTime: string; title: string; service: string; employeeId: string; employeeName: string; status: string; color: string };
export type CalendarBlock = { _id: string; title: string; date: string; endDate: string; startTime: string; endTime: string; notes: string; color: string; allDay: boolean };
export type OwnerSchedule = { timezone: string; today: string; appointments: CalendarAppointment[]; blocks: CalendarBlock[]; employees: { _id: string; userId: string; name: string; position: string; workingHours: { start: string; end: string }; daysOff: string[] }[]; integration: { provider: string; status: string }; locations: { _id: string; name: string }[]; truncated: boolean };
export const ownerCalendarApi = {
  get: (from: string, to: string) => api.get<{ data: OwnerSchedule }>('/business/schedule', { params: { from, to } }).then(r => r.data.data),
  appointment: (id: string) => api.get(`/business/schedule/appointments/${id}`).then(r => r.data.data),
  updateAppointment: (id: string, body: object) => api.put(`/business/schedule/appointments/${id}`, body),
};
