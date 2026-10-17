'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Building2, Settings2, UserRound, Circle } from 'lucide-react';

export const workspaceSettingsLinks = [
  ['overview', 'Overview'], ['business', 'Business & Locations'], ['locations', 'Locations & Hours'], ['brand', 'Brand'], ['team', 'Team & Permissions'], ['assistant', 'AI & Assistant'], ['integrations', 'Integrations'],
  ['creative', 'Creative Settings'], ['automations', 'Automation Settings'], ['website', 'Website Settings'], ['media', 'Media Settings'], ['marketing', 'Marketing Settings'], ['office', 'Office Settings'], ['management', 'Management Settings'], ['finances', 'Finance Settings'],
  ['notificationRules', 'Notifications'], ['data', 'Data Management'], ['privacy', 'Data & Privacy'], ['usage', 'Usage & Limits'], ['security', 'Security & Audit'], ['customFields', 'Custom Fields'],
];
export const globalSettingsLinks = [
  ['overview', 'Overview'], ['profile', 'Profile'], ['security', 'Account Security'], ['accounts', 'Connected Accounts'], ['billing', 'Plan & Billing'], ['notifications', 'Notifications'], ['appearance', 'Appearance'], ['accessibility', 'Accessibility'], ['language', 'Language & Region'], ['personalAi', 'Personal AI'], ['memory', 'Memory & Privacy'], ['export', 'Data & Export'],
];
export function settingsHref(scope: string, section: string) { return `/settings?scope=${scope}&section=${section}`; }
export function OwnerSettingsNav({ onNavigate }: { onNavigate?: () => void }) {
  const params = useSearchParams(), scope = params.get('scope') || (params.has('tab') ? 'global' : 'workspace'), section = params.get('section') || 'overview';
  const links = scope === 'global' ? globalSettingsLinks : workspaceSettingsLinks;
  return <nav className="nv-nav ns-sidebar-nav" aria-label="Settings navigation">
    <Link className="nv-nav-item" href="/dashboard" onClick={onNavigate} title="Back to Dashboard"><ArrowLeft size={17} /><span>Back to Dashboard</span></Link>
    <Link className={`nv-nav-item nv-nav-divider ${scope === 'workspace' ? 'active' : ''}`} href={settingsHref('workspace', 'overview')} onClick={onNavigate} title="Business Settings"><Building2 size={17} /><span>Business Settings</span></Link>
    <Link className={`nv-nav-item ${scope === 'global' ? 'active' : ''}`} href={settingsHref('global', 'overview')} onClick={onNavigate} title="Personal Settings"><UserRound size={17} /><span>Personal Settings</span></Link>
    {links.map(([id, label], i) => <Link key={id} className={`nv-nav-item ${i === 0 ? 'nv-nav-divider' : ''} ${section === id ? 'active' : ''}`} href={settingsHref(scope, id)} onClick={onNavigate} title={label} aria-label={label} aria-current={section === id ? 'page' : undefined}>{i === 0 ? <Settings2 size={16} /> : <Circle size={8} />}<span>{label}</span></Link>)}
  </nav>;
}
