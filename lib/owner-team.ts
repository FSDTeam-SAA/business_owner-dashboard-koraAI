import api from './axios';
export type TeamUser = { _id: string; name: string; email: string; phoneNumber?: string; isBlocked: boolean; profileImage?: { url?: string } };
export type TeamProfile = { location_id?: string; firstName?: string; lastName?: string; dateOfBirth?: string; language?: string; street?: string; postalCode?: string; city?: string; country?: string; emergencyContact?: string; employmentType?: string; startDate?: string; weeklyHours?: number; hourlyRate?: number; skills?: string[]; internalNote?: string; notifications?: { scheduleChanges: boolean; appointments: boolean; teamMessages: boolean; marketing: boolean }; invitation?: { status: string; channel: string; at: string }; photo?: { mime?: string }; notes?: { _id: string; body: string; at: string; author: string }[]; history?: { action: string; at: string; actor: string }[] };
export type TeamEmployee = { _id: string; userId: TeamUser; position: string; status: string; workingHours: { start: string; end: string }; daysOff: string[]; createdAt: string; avgRating: number; koraGoAccess?: boolean; profile: TeamProfile; todayAppointments: number; utilization: number | null; attendance?: { isActiveSession: boolean; checkInTime?: string; totalWorkedMinutes: number } | null };
export type TeamAppointment = { _id: string; customer?: { name: string }; client?: { name: string }; service: string; appointmentDate: string; startTime: string; endTime: string; status: string; completedAt?: string };
export type TeamFile = { _id: string; filename: string; bytes: number; createdAt: string };
export type TeamRecord = { employee: TeamEmployee; profile: TeamProfile; appointments: TeamAppointment[]; attendance: { date: string; totalWorkedMinutes: number; checkInTime?: string }[]; leaves: { _id: string; leaveType: string; startDate: string; endDate: string; totalDays: number; status: string }[]; membership: { permissions: string[]; status: string } | null; files: TeamFile[]; metrics: { monthAppointments: number; completed: number; noShows: number; hoursWorked: number; rating: number | null } };
export type TeamFormData = { firstName: string; lastName: string; email: string; phoneNumber: string; position: string; location_id: string; employmentType: string; startDate: string; dateOfBirth: string; language: string; street: string; postalCode: string; city: string; country: string; emergencyContact: string; weeklyHours: string; hourlyRate: string; skills: string[]; internalNote: string; workingHours: { start: string; end: string }; daysOff: string[]; appAccess: boolean; koraGoAccess: boolean; sendInvitation: boolean; notifications: { scheduleChanges: boolean; appointments: boolean; teamMessages: boolean; marketing: boolean } };
const root = '/business/team';
export const ownerTeamApi = {
  list: () => api.get<{ data: { employees: TeamEmployee[]; locations: { _id: string; name: string }[] } }>(root).then(r => r.data.data),
  record: (id: string) => api.get<{ data: TeamRecord }>(`${root}/${id}`).then(r => r.data.data),
  create: (data: TeamFormData) => api.post<{ data: { employee: TeamEmployee; invitation: { status: string; message: string } } }>(root, data).then(r => r.data.data),
  update: (id: string, data: TeamFormData) => api.patch(`${root}/${id}`, data).then(r => r.data.data),
  invite: (id: string) => api.post<{ data: { status: string; message: string } }>(`${root}/${id}/invite`).then(r => r.data.data),
  revoke: (id: string) => api.post(`${root}/${id}/revoke-sessions`).then(r => r.data.data),
  status: (id: string, status: string) => api.patch(`${root}/${id}/status`, { status }).then(r => r.data.data),
  note: (id: string, body: string) => api.post(`${root}/${id}/notes`, { body }).then(r => r.data.data),
  permissions: (id: string, permissions: string[]) => api.patch(`${root}/${id}/permissions`, { permissions }).then(r => r.data.data),
  photo: (id: string) => api.get<{ data: { url: string } | null }>(`${root}/${id}/photo`).then(r => r.data.data),
  upload: (id: string, file: File, photo = false) => { const data = new FormData(); data.append('file', file); return api.post(`${root}/${id}/${photo ? 'photo' : 'files'}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data); },
  download: async (id: string, file: TeamFile) => { const response = await api.get(`${root}/${id}/files/${file._id}`, { responseType: 'blob' }); const url = URL.createObjectURL(response.data); const link = document.createElement('a'); link.href = url; link.download = file.filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); },
};
