import api from "./axios";

export type ChatSource = { id: string; title: string };
export type AssistantMessage = { _id?: string; role: "user" | "kora" | "system"; content: string; createdAt?: string; meta?: { sources?: ChatSource[] } };
export type Conversation = { _id: string; title: string; folder_id: string | null; lastMessageAt: string; pinned: boolean; status: string; messages?: AssistantMessage[]; earlierMessages?: number };
export type ChatFolder = { _id: string; name: string; description: string; updatedAt: string; chatCount: number };
export type Knowledge = { _id: string; title: string; content?: string; block: string; topic: string; sourceType: "manual" | "document" | "url" | "business"; sourceUrl: string; fileName: string; fileBytes?: number; visibility: "assistant" | "private"; status: "active" | "archived"; revision: number; updatedAt: string };
export type KnowledgeBlock = { key: string; name: string; description: string; count: number; assistantCount: number; updatedAt: string | null; topics: { name: string; count: number }[] };
export type KnowledgeSummary = { blocks: KnowledgeBlock[]; total: number; assistantCount: number; files: number; updatedAt: string | null; recentFiles: Knowledge[]; graphItems: Knowledge[] };
export type Paged<T> = { data: T[]; meta: { page: number; pages: number; total: number } };
const root = "/business/assistant";
export const ownerAssistantApi = {
  conversations: (params: { page?: number; limit?: number; q?: string; folder?: string; archived?: boolean } = {}) => api.get<Paged<Conversation>>(`${root}/conversations`, { params }).then(r => r.data),
  conversation: (id: string) => api.get<{ data: Conversation }>(`${root}/conversations/${id}`).then(r => r.data.data),
  updateConversation: (id: string, data: { title?: string; folder_id?: string | null; pinned?: boolean; status?: string }) => api.patch(`${root}/conversations/${id}`, data).then(r => r.data.data),
  chat: (message: string, conversationId?: string, folderId?: string) => api.post<{ data: { conversationId: string; text: string; sources: ChatSource[] } }>(`${root}/chat`, { message, conversationId, folderId }).then(r => r.data.data),
  folders: () => api.get<{ data: ChatFolder[] }>(`${root}/folders`).then(r => r.data.data),
  archivedFolders: () => api.get<{ data: ChatFolder[] }>(`${root}/folders`, { params: { archived: true } }).then(r => r.data.data),
  createFolder: (data: { name: string; description: string }) => api.post(`${root}/folders`, data).then(r => r.data.data),
  updateFolder: (id: string, data: { name?: string; description?: string; archive?: boolean }) => api.patch(`${root}/folders/${id}`, data).then(r => r.data.data),
  summary: () => api.get<{ data: KnowledgeSummary }>(`${root}/knowledge/summary`).then(r => r.data.data),
  knowledge: (params: { block?: string; topic?: string; q?: string; page?: number; limit?: number; archived?: boolean } = {}) => api.get<Paged<Knowledge>>(`${root}/knowledge`, { params }).then(r => r.data),
  knowledgeItem: (id: string) => api.get<{ data: Knowledge }>(`${root}/knowledge/${id}`).then(r => r.data.data),
  createKnowledge: (data: object) => api.post(`${root}/knowledge`, data).then(r => r.data.data),
  updateKnowledge: (id: string, data: object) => api.patch(`${root}/knowledge/${id}`, data).then(r => r.data.data),
  importDocument: (data: FormData) => api.post(`${root}/knowledge/import`, data, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data.data),
};
export function assistantDate(date?: string | null) { return date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "No updates yet"; }
