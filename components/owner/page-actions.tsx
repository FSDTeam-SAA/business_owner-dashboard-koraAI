"use client";
import { useState } from 'react';
import { MessageSquare, Plus, Sparkles } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useKoraDrawer } from './kora-drawer';
export function OwnerPageActions({ topic, actions = [] }: { topic: string; actions?: { label: string; onClick: () => void }[] }) {
  const openKora = useKoraDrawer();
  const [ask, setAsk] = useState(false), [prompt, setPrompt] = useState('');
  return <><DropdownMenu><DropdownMenuTrigger asChild><button className="nv-icon-button nc-add" aria-label={`Open ${topic} actions`}><Plus size={20} /></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="nv-account-menu"><DropdownMenuItem onClick={() => setAsk(true)}><Sparkles size={15} />Ask Kora</DropdownMenuItem><DropdownMenuItem onClick={() => openKora(`Help me review my ${topic}.`)}><MessageSquare size={15} />Chat with Kora</DropdownMenuItem>{actions.map(row => <DropdownMenuItem key={row.label} onClick={row.onClick}><Plus size={15} />{row.label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu><Dialog open={ask} onOpenChange={setAsk}><DialogContent className="nc-ask-dialog"><DialogTitle>Ask Kora</DialogTitle><DialogDescription>What can I help you with?</DialogDescription><form onSubmit={event => { event.preventDefault(); if (prompt.trim()) { setAsk(false); openKora(prompt.trim()); } }}><textarea value={prompt} onChange={event => setPrompt(event.target.value)} maxLength={4000} required placeholder={`Ask anything about your ${topic}…`} /><button className="nv-button" disabled={!prompt.trim()}>Continue to chat</button></form><small>You review and confirm business actions.</small></DialogContent></Dialog></>;
}
