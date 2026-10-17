"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight, Loader2, Search, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AppointmentDetailsDialog } from "@/components/appointment-details-dialog";
import { apiError, ownerOverviewApi } from "@/lib/owner-overview";
import { ownerNavigation } from "@/lib/owner-navigation";

export function SearchDialog() {
  const [open, setOpen] = useState(false), [query, setQuery] = useState(""), [debounced, setDebounced] = useState("");
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  useEffect(() => { const listener = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(value => !value); } }; window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener); }, []);
  useEffect(() => { const timer = setTimeout(() => setDebounced(query.trim()), 250); return () => clearTimeout(timer); }, [query]);
  const search = useQuery({ queryKey: ["owner-search", debounced], queryFn: () => ownerOverviewApi.search(debounced), enabled: open && debounced.length >= 2, staleTime: 30_000 });
  const sections = [...ownerNavigation.filter(item => item.enabled), { href: "/settings", label: "Settings" }, { href: "/help-center", label: "Help Center" }, { href: "/subscription", label: "Subscription" }].filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase()));
  return <><button className="nv-icon-button nv-search-trigger" aria-label="Search your business (Ctrl+K)" onClick={() => setOpen(true)}><Search size={17} /></button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="nv-search-dialog"><DialogTitle className="sr-only">Search your business</DialogTitle><DialogDescription className="sr-only">Find pages, appointments and team members.</DialogDescription><div className="nv-search-input"><Search size={18} /><input aria-label="Search pages, appointments and team" value={query} onChange={event => setQuery(event.target.value)} maxLength={80} placeholder="Search your business…" autoComplete="off" /></div><div className="nv-search-results">
    {sections.length > 0 && <div><h3>Pages</h3>{sections.map(item => <Link className="nv-search-result" key={item.href} href={item.href} onClick={() => setOpen(false)}><span>{item.label}</span><ChevronRight size={14} /></Link>)}</div>}
    {debounced.length >= 2 && search.isFetching && <p className="nv-search-hint"><Loader2 size={14} className="animate-spin" /> Searching…</p>}
    {search.isError && <div className="nv-inline-error" role="alert">{apiError(search.error)}<button onClick={() => search.refetch()}>Retry</button></div>}
    {search.data && debounced.length >= 2 && <><div>{search.data.appointments.length > 0 && <h3>Appointments</h3>}{search.data.appointments.map(item => <button className="nv-search-result" key={item._id} onClick={() => { setOpen(false); setAppointmentId(item._id); }}><CalendarDays size={15} /><span>{item.title || item.service || "Appointment"}<small>{item.appointmentDate?.slice(0, 10)} · {item.startTime}</small></span><ChevronRight size={14} /></button>)}</div><div>{search.data.employees.length > 0 && <h3>Team</h3>}{search.data.employees.map(item => <Link className="nv-search-result" key={item._id} href={`/employees?employee=${encodeURIComponent(item._id)}`} onClick={() => setOpen(false)}><Users size={15} /><span>{item.name}<small>{item.position}</small></span><ChevronRight size={14} /></Link>)}</div>{!sections.length && !search.data.appointments.length && !search.data.employees.length && <p className="nv-search-hint">No results for “{debounced}”. Try a service or team member’s name.</p>}</>}
    {query.trim().length < 2 && <p className="nv-search-hint">Type at least two characters to search appointments and team members.</p>}
  </div><footer className="nv-search-footer"><span>Search your business</span><kbd>esc to close</kbd></footer></DialogContent></Dialog><AppointmentDetailsDialog open={Boolean(appointmentId)} onOpenChange={value => { if (!value) setAppointmentId(null); }} appointmentId={appointmentId} /></>;
}
