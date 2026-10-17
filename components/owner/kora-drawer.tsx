"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUp, Loader2, Plus, Sparkles, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiError, ownerOverviewApi } from "@/lib/owner-overview";

const KoraContext = createContext<(prompt?: string) => void>(() => undefined);
export const useKoraDrawer = () => useContext(KoraContext);
export function KoraDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<{ role: "user" | "kora"; content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const send = useMutation({ mutationFn: (message: string) => ownerOverviewApi.chat(message, conversationId), onSuccess: (data, message) => { setConversationId(data.conversationId); setMessages(current => [...current, { role: "user", content: message }, { role: "kora", content: data.text }]); setInput(""); } });
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, send.isPending]);
  function openDrawer(prompt?: string) { if (prompt) setInput(prompt); setOpen(true); }
  return <KoraContext.Provider value={openDrawer}>{children}<Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className="nv-drawer-overlay" /><Dialog.Content className="nv-kora-drawer" aria-describedby="kora-description"><header className="nv-drawer-heading"><span className="nv-kora-icon"><Sparkles size={17} /></span><div><Dialog.Title>Ask Kora</Dialog.Title><Dialog.Description id="kora-description">Your business assistant</Dialog.Description></div><button className="nv-icon-button" aria-label="New conversation" disabled={send.isPending} onClick={() => { setMessages([]); setConversationId(undefined); send.reset(); setInput(""); }}><Plus size={16} /></button><Dialog.Close className="nv-icon-button" aria-label="Close Kora"><X size={16} /></Dialog.Close></header><div className="nv-kora-messages">
    {messages.length === 0 && <div className="nv-kora-welcome"><span className="nv-orb-mini"><Sparkles size={22} /></span><h3>A little clarity for your day.</h3><p>Ask about your schedule, your team or what needs attention. I’ll use your current business data.</p><div className="nv-kora-prompts">{["Summarize my day", "Review this week’s schedule", "Where does my team need support?"].map(prompt => <button key={prompt} onClick={() => setInput(prompt)}>{prompt}<ArrowUp size={12} /></button>)}</div></div>}
    {messages.map((message, index) => <div key={index} className={`nv-kora-message ${message.role}`}><span>{message.role === "kora" ? "Kora" : "You"}</span><p>{message.content}</p></div>)}
    {send.isPending && <div className="nv-kora-message user"><span>You</span><p>{send.variables}</p><div className="nv-kora-thinking"><Loader2 size={13} className="animate-spin" /> Kora is thinking…</div></div>}
    <div ref={scrollRef} />
  </div><form className="nv-kora-composer" onSubmit={event => { event.preventDefault(); if (input.trim() && !send.isPending) send.mutate(input.trim()); }}>{send.isError && <p className="nv-inline-error" role="alert">{apiError(send.error)}</p>}<label className="sr-only" htmlFor="kora-message">Message Kora</label><textarea id="kora-message" value={input} onChange={e => setInput(e.target.value)} maxLength={4000} placeholder="Ask anything about your business…" rows={3} disabled={send.isPending} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim() && !send.isPending) send.mutate(input.trim()); } }} /><div><span>Advice & drafts · You stay in control</span><button type="submit" className="nv-send-button" aria-label="Send to Kora" disabled={!input.trim() || send.isPending}>{send.isPending ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={15} />}</button></div></form></Dialog.Content></Dialog.Portal></Dialog.Root></KoraContext.Provider>;
}
