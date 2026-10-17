'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Clock3, LayoutGrid, List, Loader2, Pencil, Plus, Search, Scissors, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { servicesApi } from '@/lib/api';
import { apiError } from '@/lib/owner-overview';
import { toast } from 'sonner';
import './tool-pages.css';

type Service = { _id: string; name: string; description?: string; duration: number; price: number; isActive: boolean };
type Form = { name: string; description: string; duration: string; price: string; isActive: boolean };
const blank: Form = { name: '', description: '', duration: '60', price: '0', isActive: true };
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export function ServicesPage() {
  const client = useQueryClient();
  const [search, setSearch] = useState(''), [status, setStatus] = useState('all'), [page, setPage] = useState(1);
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [editor, setEditor] = useState<Service | 'new' | null>(null), [form, setForm] = useState<Form>(blank), [remove, setRemove] = useState<Service | null>(null);
  const query = useQuery({ queryKey: ['services', search, status, page], queryFn: () => servicesApi.getAll({ page, limit: 12, search: search || undefined, isActive: status === 'all' ? undefined : status === 'active' }).then(r => r.data as { data: Service[]; meta: { total: number; totalPages: number } }) });
  const services = query.data?.data || [], total = query.data?.meta?.total || 0, pages = Math.max(1, query.data?.meta?.totalPages || 1);
  const refresh = () => { void client.invalidateQueries({ queryKey: ['services'] }); };
  const save = useMutation({ mutationFn: () => {
    const duration = Number(form.duration), price = Number(form.price);
    if (!form.name.trim()) throw new Error('Enter a service name.');
    if (!Number.isInteger(duration) || duration < 1) throw new Error('Duration must be a positive whole number.');
    if (!form.price.trim() || !Number.isFinite(price) || price < 0) throw new Error('Enter a valid price of zero or more.');
    const body = { ...form, name: form.name.trim(), duration, price };
    return editor && editor !== 'new' ? servicesApi.update(editor._id, body) : servicesApi.create(body);
  }, onSuccess: () => { refresh(); setEditor(null); toast.success(editor === 'new' ? 'Service created' : 'Service updated'); } });
  const deletion = useMutation({ mutationFn: () => servicesApi.delete(remove!._id), onSuccess: () => { refresh(); setRemove(null); if (services.length === 1 && page > 1) setPage(page - 1); toast.success('Service deleted'); } });
  function edit(service: Service | 'new') { save.reset(); setForm(service === 'new' ? blank : { name: service.name, description: service.description || '', duration: String(service.duration), price: String(service.price), isActive: service.isActive }); setEditor(service); }
  const displayError = (error: unknown) => error instanceof Error && !('response' in error) ? error.message : apiError(error);
  return <div className="ot-page"><Header title="Services" action={<button className="ot-button primary" onClick={() => edit('new')}><Plus size={15} />Add service</button>} />
    <main className="ot-content">
      <div className="ot-heading"><div><span className="ot-eyebrow">YOUR SERVICE CATALOG</span><h1>Great service starts here.</h1><p>Set clear prices, plan appointment times and keep your offerings up to date.</p></div><span className="ot-context"><Scissors size={15} />Services & pricing</span></div>
      <div className="ot-stats three">
        <Summary label="Services found" value={query.isLoading ? '—' : total} detail={search || status !== 'all' ? 'Matching your filters' : 'In your service catalog'} Icon={Scissors} />
        <Summary label="Active services" value={query.isLoading ? '—' : services.filter(s => s.isActive).length} detail="Available on this page" Icon={Check} />
        <Summary label="Average duration" value={services.length ? `${Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length)} min` : '—'} detail="For services on this page" Icon={Clock3} />
      </div>
      <section className="ot-panel">
        <div className="ot-panel-heading"><div><h2>Your services</h2><p>Everything your team offers, organized in one place.</p></div><span className="ot-count">{total} services</span></div>
        <div className="ot-toolbar"><div className="ot-tabs" aria-label="Service status">{['all', 'active', 'inactive'].map(value => <button key={value} aria-pressed={status === value} onClick={() => { setStatus(value); setPage(1); }}>{value}</button>)}</div><label className="ot-search"><Search size={15} /><input aria-label="Search services" placeholder="Search services…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label><div className="ot-view-toggle"><button aria-label="Card view" aria-pressed={view === 'cards'} onClick={() => setView('cards')}><LayoutGrid size={15} /></button><button aria-label="Table view" aria-pressed={view === 'table'} onClick={() => setView('table')}><List size={16} /></button></div></div>
        {query.isError ? <ToolError error={query.error} retry={() => void query.refetch()} /> : query.isLoading ? <div className="ot-empty"><Loader2 className="animate-spin" size={22} /><p>Loading your service catalog…</p></div> : !services.length ? <div className="ot-empty"><Scissors size={28} /><h3>{search || status !== 'all' ? 'No matching services' : 'Build your service catalog'}</h3><p>{search || status !== 'all' ? 'Try another name or adjust your status filter.' : 'Add your first service with a price and appointment duration.'}</p><button className="ot-button" onClick={() => search || status !== 'all' ? (setSearch(''), setStatus('all'), setPage(1)) : edit('new')}>{search || status !== 'all' ? 'Clear filters' : 'Add a service'}</button></div> : view === 'cards' ? <div className="ot-service-grid">{services.map(service => <article className="ot-service-card" key={service._id}><div className="ot-service-top"><span className="ot-service-icon"><Scissors size={20} /></span><ServiceStatus active={service.isActive} /></div><h3>{service.name}</h3><p className="ot-service-description">{service.description || 'Add a description to help your team understand this service.'}</p><div className="ot-service-meta"><span><Clock3 size={14} />{service.duration} min</span><strong>{money(service.price)}<small>USD</small></strong></div><div className="ot-service-actions"><button className="ot-button" onClick={() => edit(service)}><Pencil size={13} />Edit service</button><button className="ot-icon-button danger" aria-label={`Delete ${service.name}`} onClick={() => { deletion.reset(); setRemove(service); }}><Trash2 size={15} /></button></div></article>)}</div> : <div className="ot-table-scroll"><table className="ot-table"><thead><tr>{['Service', 'Duration', 'Price (USD)', 'Status', 'Actions'].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{services.map(service => <tr key={service._id}><td><strong>{service.name}</strong><small>{service.description || 'No description'}</small></td><td>{service.duration} min</td><td>{money(service.price)}</td><td><ServiceStatus active={service.isActive} /></td><td><div className="ot-row-actions"><button className="ot-button" onClick={() => edit(service)}><Pencil size={13} />Edit</button><button className="ot-icon-button danger" aria-label={`Delete ${service.name}`} onClick={() => { deletion.reset(); setRemove(service); }}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
        <div className="ot-pagination"><span>{total ? `${(page - 1) * 12 + 1}–${Math.min(page * 12, total)} of ${total} services` : '0 services'}</span><div><button className="ot-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>{page} / {pages}</span><button className="ot-button" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div></div>
      </section>
    </main>
    <Dialog open={!!editor} onOpenChange={open => { if (!open && !save.isPending) setEditor(null); }}><DialogContent className="ot-dialog"><DialogHeader><DialogTitle>{editor === 'new' ? 'Add a service' : 'Edit service'}</DialogTitle><DialogDescription>Choose a name, price and appointment duration for your team.</DialogDescription></DialogHeader><form onSubmit={e => { e.preventDefault(); save.mutate(); }}><label className="ot-field">Service name<input autoFocus required maxLength={150} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Signature haircut" /></label><label className="ot-field">Description<textarea rows={3} maxLength={2000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is included in this service?" /></label><div className="ot-form-grid"><label className="ot-field">Duration (minutes)<input required type="number" min={1} step={1} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></label><label className="ot-field">Price (USD)<input required type="number" min={0} step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label></div><label className="ot-checkbox"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /><span>Active service<small>Make this service available to your team.</small></span></label>{save.isError && <p className="ot-error" role="alert">{displayError(save.error)}</p>}<div className="ot-dialog-actions"><button className="ot-button" type="button" disabled={save.isPending} onClick={() => setEditor(null)}>Cancel</button><button className="ot-button primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : editor === 'new' ? 'Create service' : 'Save changes'}</button></div></form></DialogContent></Dialog>
    <Dialog open={!!remove} onOpenChange={open => { if (!open && !deletion.isPending) setRemove(null); }}><DialogContent className="ot-dialog"><DialogHeader><DialogTitle>Delete {remove?.name}?</DialogTitle><DialogDescription>This removes the service from your catalog. You can mark it inactive instead by editing it.</DialogDescription></DialogHeader>{deletion.isError && <p className="ot-error" role="alert">{apiError(deletion.error)}</p>}<div className="ot-dialog-actions"><button className="ot-button" disabled={deletion.isPending} onClick={() => setRemove(null)}>Keep service</button><button className="ot-button danger" disabled={deletion.isPending} onClick={() => deletion.mutate()}>{deletion.isPending ? 'Deleting…' : 'Delete service'}</button></div></DialogContent></Dialog>
  </div>;
}

export function Summary({ label, value, detail, Icon }: { label: string; value: string | number; detail: string; Icon: typeof Scissors }) { return <article className="ot-stat"><div><span>{label}</span><Icon size={16} /></div><strong>{value}</strong><p>{detail}</p></article>; }
export function ToolError({ error, retry }: { error: unknown; retry: () => void }) { return <div className="ot-error" role="alert"><span>{apiError(error)}</span><button className="ot-button" onClick={retry}>Try again</button></div>; }
function ServiceStatus({ active }: { active: boolean }) { return <span className={`ot-status ${active ? 'active' : 'disabled'}`}><i />{active ? 'Active' : 'Inactive'}</span>; }
