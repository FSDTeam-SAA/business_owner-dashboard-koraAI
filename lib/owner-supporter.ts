import api from './axios';
export type SupporterChannel = 'phone' | 'whatsapp';
export type SupporterSection = Record<string, unknown>;
export type SupporterConfig = { channel: SupporterChannel; revision: number; draft: Record<string, SupporterSection>; published: Record<string, SupporterSection> | null; publishedAt: string | null; updatedAt: string | null; deployment: { available: boolean; status: string; message: string } };
export type SupporterKnowledge = { _id: string; title: string; content: string; channels: SupporterChannel[]; status: 'draft' | 'published' | 'archived'; version: number; updatedAt: string };
export type SupporterOverview = { channels: { channel: SupporterChannel; connection: string; phoneNumber: string; provider: string; today: number; active: number; handovers: number; completedToday: number; avgDurationSec: number | null; configuration: { revision: number; publishedAt?: string } | null }[]; events: { _id: string; text: string; channel: string; status: string; at: string }[]; today: string; timezone: string; appointmentsToday: number; knowledge: { published: number; drafts: number; archived: number }; services: { _id: string; name: string; published: boolean }[]; employees: { _id: string; name: string; position: string }[]; providerDeploymentAvailable: boolean };
export type SupporterPreview = { valid: boolean; mode: string; sideEffectsExecuted: boolean; message: string; fallback: string; flow: { id: string; label: string; next: string[] }[]; deployment: string };
const base = '/business/supporter';
export const supporterApi = {
  overview: () => api.get<{ data: SupporterOverview }>(base).then(r => r.data.data),
  config: (channel: SupporterChannel) => api.get<{ data: SupporterConfig }>(`${base}/${channel}`).then(r => r.data.data),
  save: (channel: SupporterChannel, section: string, revision: number, values: SupporterSection) => api.patch<{ data: SupporterConfig }>(`${base}/${channel}/sections/${section}`, { revision, values }).then(r => r.data.data),
  publish: (channel: SupporterChannel, revision: number) => api.post<{ data: SupporterConfig }>(`${base}/${channel}/publish`, { revision }).then(r => r.data.data),
  discard: (channel: SupporterChannel, revision: number) => api.post<{ data: SupporterConfig }>(`${base}/${channel}/discard`, { revision }).then(r => r.data.data),
  preview: (channel: SupporterChannel, section?: string, values?: SupporterSection) => api.post<{ data: SupporterPreview }>(`${base}/${channel}/preview`, { section, values }).then(r => r.data.data),
  knowledge: (params: { channel?: SupporterChannel; status?: string; q?: string; page?: number; limit?: number } = {}) => api.get<{ data: SupporterKnowledge[]; meta: { page: number; pages: number; total: number } }>(`${base}/knowledge`, { params: { limit: 20, ...params } }).then(r => r.data),
  createKnowledge: (data: { title: string; content: string; channels: SupporterChannel[]; status: string }) => api.post<{ data: SupporterKnowledge }>(`${base}/knowledge`, data).then(r => r.data.data),
  updateKnowledge: (id: string, data: object) => api.patch<{ data: SupporterKnowledge }>(`${base}/knowledge/${id}`, data).then(r => r.data.data),
  importDocument: (data: FormData) => api.post(`${base}/knowledge/import`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data),
  importBrain: (knowledgeId: string) => api.post(`${base}/knowledge/from-brain`, { knowledgeId }).then(r => r.data.data),
};
export const supporterPath = (channel: SupporterChannel) => `/supporter/${channel === 'phone' ? 'ai-phone' : 'whatsapp-ai'}`;
export const supporterName = (channel: SupporterChannel) => channel === 'phone' ? 'AI Phone' : 'WhatsApp AI';
export const languageNames: Record<string, string> = { en: 'English', de: 'German', bn: 'Bangla', cs: 'Czech', fr: 'French', es: 'Spanish', it: 'Italian', pt: 'Portuguese', ar: 'Arabic', hi: 'Hindi', nl: 'Dutch', pl: 'Polish', tr: 'Turkish' };
type Field = { key: string; label: string; type?: 'toggle' | 'text' | 'textarea' | 'number' | 'select' | 'range' | 'services' | 'staff' | 'documents'; options?: string[]; min?: number; max?: number; step?: number; help?: string };
type Group = { title: string; description: string; fields: Field[]; special?: 'weekly' | 'routes' | 'emergency' | 'languages' | 'voice' | 'flow' | 'knowledge' };
export type SupporterSectionDefinition = { title: string; description: string; letter: string; channels: SupporterChannel[]; groups: Group[] };
const both: SupporterChannel[] = ['phone', 'whatsapp'];
const toggle = (key: string, label: string): Field => ({ key, label, type: 'toggle' });
const select = (key: string, label: string, options: string[]): Field => ({ key, label, type: 'select', options });
const count = (key: string, label: string, min: number, max: number): Field => ({ key, label, type: 'number', min, max });
const input = (key: string, label: string, type: 'text' | 'textarea' = 'text', help?: string): Field => ({ key, label, type, help });
export const supporterDefinitions: Record<string, SupporterSectionDefinition> = {
  voice: { title: 'Voice & Personality', description: 'Choose how your phone agent sounds, speaks and behaves.', letter: 'V', channels: ['phone'], groups: [
    { title: 'Voice selection', description: 'Choose a voice profile for your provider configuration.', special: 'voice', fields: [] },
    { title: 'Personality & tone', description: 'Select a foundation and fine-tune it below.', fields: [select('tone', 'Personality', ['warm', 'professional', 'relaxed', 'energetic', 'custom']), input('instructions', 'Custom instructions', 'textarea')] },
    { title: 'Speaking style', description: 'Keep conversations natural and easy to follow.', fields: [{ key: 'speed', label: 'Speaking speed', type: 'range', min: 0.5, max: 2, step: 0.1 }, { key: 'responseLength', label: 'Response length', type: 'range', min: 1, max: 5, step: 1 }, { key: 'pauseLength', label: 'Pause length', type: 'range', min: 0, max: 3, step: 0.5 }, toggle('interruptions', 'Allow interruptions'), toggle('repeatDetails', 'Repeat key details'), input('previewScript', 'Preview script', 'textarea')] },
  ] },
  hours: { title: 'Business Hours', description: 'Set when the phone agent answers and what happens outside opening hours.', letter: 'H', channels: ['phone'], groups: [
    { title: 'Weekly schedule', description: 'Create a custom phone schedule in your business timezone.', special: 'weekly', fields: [input('timezone', 'Timezone', 'text', 'IANA timezone, for example Asia/Dhaka or Europe/Berlin.')] },
    { title: 'After-hours behavior', description: 'Choose how the agent handles calls outside the schedule.', fields: [toggle('afterHoursAnswer', 'Answer calls after hours'), toggle('afterHoursBooking', 'Allow after-hours bookings'), select('afterHoursForwarding', 'Human forwarding', ['none', 'emergency', 'all']), input('awayMessage', 'Away message', 'textarea')] },
  ] },
  knowledge: { title: 'Knowledge & Answers', description: 'Control approved customer knowledge, answer boundaries and improvement drafts.', letter: 'K', channels: both, groups: [
    { title: 'Connected sources', description: 'Phone and WhatsApp share the same customer knowledge pool. Only published entries are approved.', special: 'knowledge', fields: [] },
    { title: 'Answer policy', description: 'Define when the agent answers, asks questions or hands over.', fields: [toggle('approvedOnly', 'Use approved sources only'), toggle('mentionUncertainty', 'Mention uncertainty'), toggle('askMissingContext', 'Ask when context is missing'), select('unsupported', 'Unsupported claims', ['handover', 'clarify', 'decline'])] },
    { title: 'Learning suggestions', description: 'Keep proposed knowledge changes in draft for review.', fields: [toggle('createSuggestions', 'Create draft suggestions')] },
  ] },
  appointments: { title: 'Appointment Handling', description: 'Control booking, rescheduling and cancellation preferences.', letter: 'A', channels: both, groups: [
    { title: 'Calendar connection', description: 'NOVYA Calendar remains the source of appointment availability.', fields: [toggle('enabled', 'Allow appointment booking'), { key: 'serviceIds', label: 'Bookable services', type: 'services', help: 'No selection means all eligible services. Provider deployment must also enable calendar actions.' }, { key: 'staffIds', label: 'Available employees', type: 'staff', help: 'No selection means all available team members.' }] },
    { title: 'Booking rules', description: 'Set timing and customer verification preferences.', fields: [count('minimumNoticeHours', 'Minimum notice (hours)', 0, 720), count('bufferBeforeMinutes', 'Buffer before (minutes)', 0, 180), count('bufferAfterMinutes', 'Buffer after (minutes)', 0, 180), count('maximumAdvanceDays', 'Maximum advance (days)', 1, 365), select('verification', 'Customer verification', ['phone_match', 'ask_details', 'staff_approval'])] },
    { title: 'Changes & confirmations', description: 'Configure appointment changes and confirmations.', fields: [toggle('rescheduling', 'Allow rescheduling'), count('cancellationNoticeHours', 'Cancellation notice (hours)', 0, 720), toggle('noShowWarning', 'No-show warning'), toggle('confirmationMessage', 'Send confirmation message')] },
  ] },
  emergency: { title: 'Emergency Rules', description: 'Define explicit escalation rules for sensitive customer situations.', letter: '!', channels: ['phone'], groups: [
    { title: 'Sensitive situations', description: 'Choose the intended response for high-risk topics.', special: 'emergency', fields: [] },
    { title: 'Escalation behavior', description: 'Keep communication calm during critical calls.', fields: [toggle('calmAndConcise', 'Stay calm and concise'), toggle('noProfessionalAdvice', 'Never give professional advice'), toggle('prioritySummary', 'Record priority summary')] },
    { title: 'Contacts & logging', description: 'Specify who should receive urgent notifications once provider delivery is connected.', fields: [input('emergencyContact', 'Emergency contact'), input('notificationEmail', 'Notification email')] },
  ] },
  forwarding: { title: 'Call Forwarding', description: 'Create prioritized routes for human handover and unavailable teams.', letter: 'F', channels: ['phone'], groups: [
    { title: 'Routing priority', description: 'Routes are tried in the order shown. Use international phone numbers or the shared inbox.', special: 'routes', fields: [count('ringSeconds', 'Ring duration per route (seconds)', 5, 120), select('fallback', 'Fallback destination', ['voicemail', 'inbox', 'end'])] },
    { title: 'Handover triggers', description: 'Define when the assistant requests routing to a human.', fields: [toggle('humanRequest', 'Customer requests a human'), count('confidenceThreshold', 'Low confidence threshold (%)', 0, 100), toggle('complaint', 'Complaint detected')] },
    { title: 'Context sharing', description: 'Choose the information included with a transfer.', fields: [toggle('shareSummary', 'Share live summary'), toggle('shareCustomer', 'Share matched customer record')] },
  ] },
  languages: { title: 'Languages', description: 'Choose supported languages and automatic language detection behavior.', letter: 'L', channels: both, groups: [
    { title: 'Primary language', description: 'Used for greetings when the customer language is unknown.', fields: [select('primary', 'Default language', Object.keys(languageNames)), toggle('autoDetect', 'Automatic language detection')] },
    { title: 'Supported languages', description: 'Select the languages your agent should support. Provider capabilities may differ.', special: 'languages', fields: [] },
    { title: 'Translation & fallback', description: 'Choose how mixed or unsupported languages are handled.', fields: [toggle('mirrorCustomer', 'Mirror customer language'), select('fallback', 'Unsupported language', ['offer_primary', 'offer_english', 'handover']), toggle('handover', 'Human handover if needed'), toggle('remember', 'Remember customer preference')] },
  ] },
  greeting: { title: 'Greeting & Call Flow', description: 'Edit the phone-agent greeting, intent routing and closing rules.', letter: 'G', channels: ['phone'], groups: [
    { title: 'Greeting & closing', description: 'Write the exact opening and closing for a call.', fields: [input('opening', 'Opening greeting', 'textarea'), input('closing', 'Closing message', 'textarea')] },
    { title: 'Agent flow', description: 'Select a step to edit its instructions and outgoing connections.', special: 'flow', fields: [count('confidenceThreshold', 'Confidence threshold (%)', 0, 100), select('unknownIntent', 'Unknown intent', ['clarify', 'handover'])] },
  ] },
  welcome: { title: 'Welcome Message', description: 'Create greetings for new, returning and out-of-hours customers.', letter: 'W', channels: ['whatsapp'], groups: [
    { title: 'Greeting logic', description: 'Continue existing conversations without repeating a welcome.', fields: [toggle('continueContext', 'Continue known conversation context')] },
    { title: 'Message templates', description: 'Edit the actual text used for each greeting.', fields: [input('standard', 'Standard welcome', 'textarea'), input('returning', 'Returning customer', 'textarea', 'Use {{first_name}} for a customer name.'), input('away', 'Outside availability', 'textarea'), count('firstResponseDelaySeconds', 'First response delay (seconds)', 0, 60)] },
    { title: 'Consent & disclosure', description: 'Control how the assistant identifies itself.', fields: [select('disclosure', 'AI disclosure', ['always', 'first_conversation']), input('privacyUrl', 'Privacy link')] },
  ] },
  style: { title: 'Conversation Style', description: 'Define how the WhatsApp agent writes, formats and represents your brand.', letter: 'C', channels: ['whatsapp'], groups: [
    { title: 'Tone & brand voice', description: 'The agent adopts this style in customer conversations.', fields: [select('tone', 'Tone', ['warm', 'professional', 'relaxed', 'playful', 'custom']), input('instructions', 'Brand instructions', 'textarea')] },
    { title: 'Message formatting', description: 'Keep messages readable on small screens.', fields: [select('responseLength', 'Response length', ['short', 'balanced', 'detailed']), select('emoji', 'Emoji usage', ['none', 'minimal', 'friendly']), select('paragraphs', 'Paragraph style', ['short_blocks', 'single', 'bullets'])] },
    { title: 'Writing rules', description: 'Set personalization and language preferences.', fields: [toggle('firstName', 'Use the customer’s first name'), toggle('mirrorLanguage', 'Mirror the customer’s language'), toggle('abbreviations', 'Use common abbreviations')] },
  ] },
  media: { title: 'Media & Documents', description: 'Decide how the agent should receive, analyze and send files.', letter: 'M', channels: ['whatsapp'], groups: [
    { title: 'Accepted media', description: 'Save the intended handling policy for customer uploads.', fields: [toggle('images', 'Images'), toggle('pdf', 'PDF documents'), select('voice', 'Voice messages', ['transcribe', 'handover', 'reject']), select('video', 'Videos', ['handover', 'reject'])] },
    { title: 'AI handling', description: 'Processing and storage require the matching provider adapter.', fields: [toggle('imageUnderstanding', 'Image understanding'), toggle('documentExtraction', 'Document extraction'), count('retentionDays', 'Attachment retention (days)', 0, 365)] },
    { title: 'Outgoing knowledge references', description: 'Choose approved information the agent may share. Original uploaded files are not retained.', fields: [{ key: 'outgoingDocumentIds', label: 'Approved knowledge', type: 'documents' }] },
  ] },
  handover: { title: 'Human Handover', description: 'Define when and how WhatsApp conversations should reach your team.', letter: 'H', channels: ['whatsapp'], groups: [
    { title: 'Handover triggers', description: 'Customers or low confidence can start a transfer.', fields: [toggle('humanRequest', 'Customer asks for a human'), count('confidenceThreshold', 'Low confidence threshold (%)', 0, 100), toggle('complaint', 'Complaint detected'), toggle('vip', 'VIP customer')] },
    { title: 'Team routing', description: 'Route conversations using priority and availability.', special: 'routes', fields: [select('outsideHours', 'Outside hours', ['inbox', 'next_open', 'emergency'])] },
    { title: 'Conversation context', description: 'Choose what your team receives with the handover.', fields: [toggle('fullHistory', 'Full chat history'), toggle('aiSummary', 'AI summary')] },
  ] },
  availability: { title: 'Availability', description: 'Set when WhatsApp should reply instantly and how away mode behaves.', letter: 'A', channels: ['whatsapp'], groups: [
    { title: 'Weekly availability', description: 'Use a weekly response schedule and date-specific closures.', special: 'weekly', fields: [input('timezone', 'Timezone', 'text', 'IANA timezone, for example Asia/Dhaka.'), toggle('alwaysReceive', 'Always receive messages')] },
    { title: 'Away behavior', description: 'Define the first response and available actions outside hours.', fields: [toggle('sendAwayMessage', 'Send away message'), toggle('awayBooking', 'Allow appointment booking'), select('awayHandover', 'Human handover', ['inbox', 'next_open', 'emergency'])] },
    { title: 'Response timing', description: 'Keep automated replies natural and predictable.', fields: [count('typingDelaySeconds', 'Typing delay (seconds)', 0, 30), count('maximumWaitSeconds', 'Maximum initial wait (seconds)', 1, 120)] },
  ] },
  flow: { title: 'WhatsApp Agent Flow', description: 'Build messages, decisions, booking and handovers in one editable flow.', letter: 'F', channels: ['whatsapp'], groups: [
    { title: 'Agent flow', description: 'Select a step to edit its instructions and outgoing connections.', special: 'flow', fields: [count('confidenceThreshold', 'Confidence threshold (%)', 0, 100), select('unknownIntent', 'Unknown requests', ['clarify', 'handover'])] },
  ] },
};
export const supporterSectionOrder: Record<SupporterChannel, string[]> = { phone: ['voice', 'greeting', 'hours', 'appointments', 'forwarding', 'languages', 'knowledge', 'emergency'], whatsapp: ['welcome', 'style', 'appointments', 'media', 'handover', 'availability', 'languages', 'knowledge', 'flow'] };
export function supporterSectionTitle(key: string, channel: SupporterChannel) { return key === 'appointments' && channel === 'whatsapp' ? 'Booking & Rescheduling' : supporterDefinitions[key].title; }
export const prettySupporterValue = (value: string) => languageNames[value] || value.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
