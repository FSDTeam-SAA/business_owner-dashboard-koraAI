'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerSettingsApi, type CustomField, type SettingsValue } from '@/lib/owner-settings';
import { apiError } from '@/lib/owner-overview';
import { toast } from 'sonner';
import './custom-field-values.css';

export function OwnerCustomFieldValues({ entity, recordId }: { entity: 'customer' | 'appointment' | 'team'; recordId: string }) {
  const query = useQuery({ queryKey: ['owner-custom-values', entity, recordId], queryFn: () => ownerSettingsApi.fieldValues(entity, recordId), enabled: !!recordId });
  if (query.isLoading) return <p className="ocf-muted">Loading custom fields…</p>;
  if (query.isError) return <div className="ocf-error" role="alert">{apiError(query.error)} <button type="button" onClick={() => void query.refetch()}>Reload custom fields</button></div>;
  if (!query.data?.fields.length) return null;
  return <CustomValuesForm key={`${entity}:${recordId}:${query.data.revision}`} entity={entity} recordId={recordId} {...query.data} />;
}
function CustomValuesForm({ entity, recordId, fields, values: saved, revision }: { entity: string; recordId: string; fields: CustomField[]; values: Record<string, SettingsValue>; revision: number }) {
  const [values, setValues] = useState(saved), client = useQueryClient();
  const save = useMutation({ mutationFn: () => ownerSettingsApi.saveFieldValues(entity, recordId, values, revision), onSuccess: () => { void client.invalidateQueries({ queryKey: ['owner-custom-values', entity, recordId] }); toast.success('Custom fields saved'); } });
  return <section className="ocf-panel"><h3>Custom fields</h3><p className="ocf-muted">Additional information defined for your business.</p><div className="ocf-fields">{fields.map(field => <label className="ocf-field" key={field._id}><span>{field.label}{field.required ? ' *' : ''}</span>{field.kind === 'checkbox' ? <input type="checkbox" checked={Boolean(values[field._id])} onChange={e => setValues(s => ({ ...s, [field._id]: e.target.checked }))} /> : field.kind === 'select' ? <select value={String(values[field._id] ?? '')} onChange={e => setValues(s => ({ ...s, [field._id]: e.target.value }))}><option value="">Choose an option</option>{field.options.map(value => <option key={value}>{value}</option>)}</select> : <input type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'} step={field.kind === 'number' ? 'any' : undefined} value={String(values[field._id] ?? '')} maxLength={4000} onChange={e => setValues(s => ({ ...s, [field._id]: field.kind === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value }))} />}</label>)}</div>{save.isError && <p className="ocf-error" role="alert">{apiError(save.error)}</p>}<div className="ocf-actions"><button type="button" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Saving…' : 'Save custom fields'}</button></div></section>;
}
