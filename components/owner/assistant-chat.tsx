"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ArrowUp, CalendarDays, Check, Copy, Folder, Loader2, MessageSquare, Mic, Pin, Plus, Sparkles, Users } from "lucide-react";
import { Header } from "@/components/layout/header";
import { ownerAssistantApi, type AssistantMessage, type Conversation } from "@/lib/owner-assistant";
import { apiError } from "@/lib/owner-overview";

export function AssistantChatPage() { return <Suspense fallback={<div className="na-loading"><Loader2 className="animate-spin" size={20} /></div>}><ChatRoute /></Suspense>; }
type VoiceRecognition = { lang: string; interimResults: boolean; start: () => void; stop: () => void; onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } }; length: number } }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
function ChatRoute() {
  const params = useSearchParams(), id = params.get("chat") || undefined;
  return <AssistantChat key={`${id || "new"}:${params.get("folder") || ""}`} chatId={id} folderId={params.get("folder") || undefined} />;
}
function AssistantChat({ chatId, folderId }: { chatId?: string; folderId?: string }) {
  const router = useRouter(), queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const voiceRef = useRef<VoiceRecognition | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const browser = window as Window & { SpeechRecognition?: new () => VoiceRecognition; webkitSpeechRecognition?: new () => VoiceRecognition };
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Recognition) return;
    const voice = new Recognition(); voice.lang = "en-US"; voice.interimResults = false;
    voice.onresult = event => { const transcript = event.results[event.results.length - 1][0].transcript; setInput(previous => `${previous}${previous ? " " : ""}${transcript}`.slice(0, 4000)); };
    voice.onerror = () => { setListening(false); setVoiceError("Voice input couldn’t start. Check your microphone permission or type your message."); };
    voice.onend = () => setListening(false); voiceRef.current = voice;
    // Restore browser-only voice capability after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceAvailable(true);
    return () => { voice.onresult = null; voice.onerror = null; voice.onend = null; voice.stop(); };
  }, []);
  const chat = useQuery({ queryKey: ["assistant", "conversation", chatId], queryFn: () => ownerAssistantApi.conversation(chatId!), enabled: Boolean(chatId) });
  const folders = useQuery({ queryKey: ["assistant", "folders"], queryFn: ownerAssistantApi.folders });
  const send = useMutation({ mutationFn: (message: string) => ownerAssistantApi.chat(message, chatId, folderId), onSuccess: (result, message) => {
    const newMessages: AssistantMessage[] = [{ role: "user", content: message }, { role: "kora", content: result.text, meta: { sources: result.sources } }];
    queryClient.setQueryData<Conversation>(["assistant", "conversation", result.conversationId], previous => ({ _id: result.conversationId, title: previous?.title || message.slice(0, 70), folder_id: previous?.folder_id || folderId || null, pinned: previous?.pinned || false, status: "active", lastMessageAt: new Date().toISOString(), messages: [...(previous?.messages || []), ...newMessages] }));
    setInput(""); queryClient.invalidateQueries({ queryKey: ["assistant", "conversations"] }); queryClient.invalidateQueries({ queryKey: ["assistant", "folders"] });
    if (!chatId) router.replace(`/assistant?chat=${result.conversationId}`);
  } });
  const update = useMutation({ mutationFn: (patch: { folder_id?: string | null; pinned?: boolean; status?: string }) => ownerAssistantApi.updateConversation(chatId!, patch), onSuccess: (_result, patch) => { queryClient.setQueryData<Conversation>(["assistant", "conversation", chatId], previous => previous ? { ...previous, ...patch } : previous); queryClient.invalidateQueries({ queryKey: ["assistant", "conversations"] }); queryClient.invalidateQueries({ queryKey: ["assistant", "folders"] }); } });
  const messages = chat.data?.messages || [];
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length, send.isPending]);
  useEffect(() => { if (copied === null) return; const timer = setTimeout(() => setCopied(null), 1800); return () => clearTimeout(timer); }, [copied]);
  const archived = chat.data?.status === "archived";
  function submit(event: React.FormEvent) { event.preventDefault(); if (input.trim() && !send.isPending && !archived) send.mutate(input.trim()); }
  const composer = <form className="na-chat-composer" onSubmit={submit}><label className="sr-only" htmlFor="assistant-input">Ask Kora anything</label><textarea id="assistant-input" placeholder="Ask Kora anything…" value={input} onChange={e => setInput(e.target.value)} maxLength={4000} rows={1} disabled={send.isPending || archived || Boolean(chatId && !chat.data)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim() && !send.isPending && !archived) send.mutate(input.trim()); } }} /><button type="button" className={`na-voice-button ${listening ? "listening" : ""}`} aria-label={listening ? "Stop voice input" : "Start voice input"} title={voiceAvailable ? "Dictate a message" : "Voice input is unavailable in this browser"} disabled={!voiceAvailable || send.isPending || archived} onClick={() => { setVoiceError(""); if (listening) { voiceRef.current?.stop(); setListening(false); } else { try { voiceRef.current?.start(); setListening(true); } catch { setVoiceError("Voice input is unavailable. Please type your message."); } } }}><Mic size={16} /></button><button type="submit" aria-label="Send message" disabled={!input.trim() || send.isPending || archived || Boolean(chatId && !chat.data)}>{send.isPending ? <Loader2 className="animate-spin" size={18} /> : <ArrowUp size={18} />}</button></form>;
  return <div className="na-page na-chat-page"><Header title="Assistant" />{chatId && <div className="na-chat-toolbar"><div><MessageSquare size={14} /><span>{chat.data?.title || "Conversation"}</span></div><label><Folder size={13} /><select aria-label="Conversation folder" value={chat.data?.folder_id || ""} onChange={e => update.mutate({ folder_id: e.target.value || null })} disabled={!chat.data || update.isPending}><option value="">No folder</option>{folders.data?.map(folder => <option key={folder._id} value={folder._id}>{folder.name}</option>)}</select></label><button className="nv-icon-button" disabled={!chat.data || update.isPending} aria-label={chat.data?.pinned ? "Unpin conversation" : "Pin conversation"} aria-pressed={chat.data?.pinned || false} onClick={() => update.mutate({ pinned: !chat.data?.pinned })}><Pin size={13} /></button><button className="nv-button" disabled={!chat.data || update.isPending} onClick={() => update.mutate({ status: archived ? "active" : "archived" })}>{archived ? "Restore" : "Archive"}</button><Link className="nv-icon-button" href="/assistant" aria-label="Start new chat"><Plus size={15} /></Link></div>}
    {chatId ? <div className="na-chat-thread" aria-live="polite">{chat.isLoading && <div className="na-loading"><Loader2 className="animate-spin" size={20} /> Loading conversation…</div>}{chat.isError && <div className="nv-inline-error" role="alert">{apiError(chat.error)}<button onClick={() => chat.refetch()}>Retry</button></div>}{chat.data?.earlierMessages ? <p className="na-muted-note">Showing the latest 100 messages.</p> : null}{messages.map((message, index) => <article key={message._id || index} className={`na-message ${message.role}`}><span className="na-message-avatar">{message.role === "kora" ? <Sparkles size={15} /> : "You"}</span><div><strong>{message.role === "kora" ? "Kora" : "You"}</strong><p>{message.content}</p>{message.meta?.sources?.length ? <div className="na-chat-sources"><span>Knowledge provided</span>{message.meta.sources.map(source => <Link key={source.id} href={`/assistant/brain/library?item=${source.id}`}>{source.title}</Link>)}</div> : null}{message.role === "kora" && <button className="na-copy" onClick={async () => { try { await navigator.clipboard.writeText(message.content); setCopied(index); } catch { setCopied(null); } }} aria-label="Copy Kora reply">{copied === index ? <Check size={12} /> : <Copy size={12} />}{copied === index ? "Copied" : "Copy"}</button>}</div></article>)}{archived && <div className="na-muted-note">This conversation is archived. Restore it to continue.</div>}{send.isPending && <article className="na-message user"><span className="na-message-avatar">You</span><div><strong>You</strong><p>{send.variables}</p><span className="na-thinking"><Loader2 size={13} className="animate-spin" /> Kora is thinking…</span></div></article>}<div ref={end} /></div> : <div className="na-chat-welcome"><h1>Kora Assistant</h1><p>Your AI assistant for your entire business.</p><div className="na-orb" aria-hidden="true"><div className="na-orb-face"><i /><i /><span /></div><span className="na-orb-star star-one" /><span className="na-orb-star star-two" /><span className="na-orb-star star-three" /></div><h2>How can I help you today?</h2>{composer}<div className="na-suggestion-chips">{[{ label: "Summarize my day", icon: Sparkles }, { label: "Show today’s schedule", icon: CalendarDays }, { label: "Analyze my business", icon: ArrowRight }, { label: "Review my team’s workload", icon: Users }].map(item => <button key={item.label} onClick={() => setInput(item.label)}><span><item.icon size={12} /></span>{item.label}</button>)}</div><p className="na-chat-footnote">Kora brings your business data and knowledge together. You stay in control of every action.</p></div>}
    {(send.isError || update.isError || voiceError) && <div className="na-chat-error nv-inline-error" role="alert">{voiceError || apiError(send.error || update.error)}</div>}{chatId && <div className="na-thread-composer">{composer}<p>Advice & drafts · Check important details before acting.</p></div>}
  </div>;
}
