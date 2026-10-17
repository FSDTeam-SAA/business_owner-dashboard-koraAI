"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowLeft, Box, MessageSquare, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ownerAssistantApi, assistantDate } from "@/lib/owner-assistant";
import { useMobileNav } from "@/components/layout/mobile-nav-context";

export function AssistantNav() {
  const pathname = usePathname(), { setIsOpen } = useMobileNav();
  const recent = useQuery({ queryKey: ["assistant", "conversations", "recent"], queryFn: () => ownerAssistantApi.conversations({ limit: 6 }) });
  const items = [{ href: "/assistant", label: "New Chat", icon: Sparkles }, { href: "/assistant/projects", label: "Projects", icon: Box }, { href: "/assistant/brain", label: "Brain", icon: Activity }];
  return <nav className="nv-nav na-context-nav" aria-label="Assistant navigation"><Link className="nv-nav-item na-back-dashboard" href="/dashboard" title="Back to Dashboard" onClick={() => setIsOpen(false)}><ArrowLeft size={16} /><span>Back to Dashboard</span></Link><div className="na-context-links">{items.map(item => <Link key={item.href} href={item.href} title={item.label} className={`nv-nav-item ${(item.href === "/assistant" ? pathname === item.href : pathname.startsWith(item.href)) ? "is-active" : ""}`} onClick={() => setIsOpen(false)}><item.icon size={16} /><span>{item.label}</span></Link>)}</div><div className="na-recents"><div><h3>Recent conversations</h3><Link href="/assistant/projects?history=all" onClick={() => setIsOpen(false)}>View all</Link></div>{recent.data?.data.map(chat => <Link key={chat._id} href={`/assistant?chat=${chat._id}`} onClick={() => setIsOpen(false)}><MessageSquare size={13} /><span><strong>{chat.title}</strong><small>{assistantDate(chat.lastMessageAt)}</small></span></Link>)}{recent.isLoading && <p>Loading conversations…</p>}{recent.isError && <button className="na-recents-retry" onClick={() => recent.refetch()}>Retry loading history</button>}{recent.data?.data.length === 0 && <p>Your chats will appear here.</p>}</div></nav>;
}
