"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMobileNav } from "@/components/layout/mobile-nav-context";
import { useDashboardI18n } from "@/lib/dashboard-i18n";
import { ownerNavigation, settingsNavigation } from "@/lib/owner-navigation";
import { AssistantNav } from "@/components/owner/assistant-nav";
import { OwnerSettingsNav } from "@/components/owner/settings-nav";

export function Sidebar() {
  const pathname = usePathname();
  const inAssistant = pathname.startsWith("/assistant");
  const inBrain = pathname.startsWith("/assistant/brain");
  const inSettings = pathname === "/settings";
  const { isOpen, setIsOpen } = useMobileNav();
  const { t } = useDashboardI18n();
  const sidebarRef = useRef<HTMLElement>(null);
  const [collapsedPreference, setCollapsedPreference] = useState<boolean | null>(null);
  const collapsed = collapsedPreference ?? inBrain;
  useEffect(() => {
    try {
      const saved = localStorage.getItem("owner-sidebar-collapsed");
      // Restore a browser preference after hydration; the server cannot read localStorage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "true" || saved === "false") setCollapsedPreference(saved === "true");
    } catch { /* Navigation still works when browser storage is unavailable. */ }
  }, []);
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsedPreference(next);
    try { localStorage.setItem("owner-sidebar-collapsed", String(next)); } catch { /* Keep the current session preference. */ }
  };
  useEffect(() => {
    if (!isOpen) return;
    const priorFocus = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || []).filter(element => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key === "Tab") {
        const items = focusable(), first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    const media = window.matchMedia("(min-width: 1024px)");
    const handleResize = () => { if (media.matches) setIsOpen(false); };
    media.addEventListener("change", handleResize);
    return () => { document.removeEventListener("keydown", handleKey); media.removeEventListener("change", handleResize); priorFocus?.focus(); };
  }, [isOpen, setIsOpen]);
  if (pathname === "/onboarding") return null;
  return <>
    {isOpen && <button className="nv-mobile-overlay" aria-label="Close navigation" onClick={() => setIsOpen(false)} tabIndex={-1} />}
    <aside id="owner-sidebar" ref={sidebarRef} className={`nv-sidebar ${isOpen ? "is-open" : ""} ${inAssistant ? "na-sidebar" : ""} ${collapsed ? "is-collapsed" : ""}`} aria-label="Main navigation" role={isOpen ? "dialog" : undefined} aria-modal={isOpen || undefined}>
      <button type="button" className="nv-sidebar-toggle nv-icon-button" onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} aria-controls="owner-sidebar">{collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}</button>
      <div className="nv-sidebar-brand"><Link href="/dashboard" onClick={() => setIsOpen(false)} aria-label="NOVYA overview"><span className="nv-monogram">N</span><span>NOVYA</span></Link><button className="nv-mobile-close nv-icon-button" aria-label="Close menu" onClick={() => setIsOpen(false)}><X size={17} /></button></div>
      {inSettings ? <Suspense><OwnerSettingsNav onNavigate={() => setIsOpen(false)} /></Suspense> : inAssistant ? <AssistantNav /> : <nav className="nv-nav" aria-label="Business owner pages">{ownerNavigation.map((item, index) => {
        const Icon = item.icon, active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const classes = `nv-nav-item ${active ? "is-active" : ""} ${index > 0 && ownerNavigation[index - 1].group !== item.group ? "nv-nav-divider" : ""}`;
        return item.enabled ? <Link href={item.href} key={item.href} className={classes} title={t(item.label)} aria-label={t(item.label)} aria-current={active ? "page" : undefined} onClick={() => setIsOpen(false)}><Icon size={16} strokeWidth={1.8} /><span>{t(item.label)}</span></Link> : <button key={item.href} className={classes} title={t(item.label)} aria-label={t(item.label)} disabled aria-disabled="true"><Icon size={16} strokeWidth={1.8} /><span>{t(item.label)}</span></button>;
      })}</nav>}
      <div className="nv-sidebar-bottom"><Link href={settingsNavigation.href} title={t(settingsNavigation.label)} aria-label={t(settingsNavigation.label)} onClick={() => setIsOpen(false)} className={`nv-nav-item ${pathname.startsWith("/settings") ? "is-active" : ""}`} aria-current={pathname.startsWith("/settings") ? "page" : undefined}><settingsNavigation.icon size={18} strokeWidth={1.6} /><span>{t(settingsNavigation.label)}</span></Link></div>
    </aside>
  </>;
}
