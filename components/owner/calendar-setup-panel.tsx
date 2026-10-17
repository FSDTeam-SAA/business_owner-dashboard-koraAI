import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight, CalendarDays, Globe, ShieldCheck, Users } from 'lucide-react';
import type { SetupData } from '@/lib/owner-setup';

export function CalendarSetupPanel({ data, continueButton }: { data: SetupData; continueButton: ReactNode }) {
  const integrations = data.facts.organization?.integrations || [];
  return <>
    <div className="nb-calendar-grid">
      <section className="nb-card nb-calendar-sources">
        <div className="nb-panel-heading"><h2>Calendar sources</h2><Link href="/settings?scope=workspace&section=catalog">Add calendar <ArrowUpRight size={13} /></Link></div>
        <div className="nb-calendar-source"><span className="nb-source-icon"><CalendarDays size={20} /></span><div><strong>NOVYA Calendar</strong><p>Appointments & blocks · Read and write</p></div><Link className="nb-source-status ready" href="/calendar"><i />Available</Link></div>
        {['Google Calendar', 'Microsoft Outlook', 'Apple Calendar'].map(provider => {
          const integration = integrations.find(row => row.provider.toLowerCase().includes(provider.split(' ')[0].toLowerCase()));
          const connected = integration?.status === 'connected';
          return <div className="nb-calendar-source" key={provider}><span className="nb-source-icon"><Globe size={20} /></span><div><strong>{provider}</strong><p>{connected ? 'Connection recorded' : 'No account connected'}</p></div><Link className={`nb-source-status ${connected ? 'ready' : ''}`} href="/settings?scope=workspace&section=integrations">{connected && <i />}{connected ? 'Review' : 'Connect'}<ArrowUpRight size={11} /></Link></div>;
        })}
      </section>
      <section className="nb-card nb-availability-panel">
        <h2>Team availability</h2><p>Bring working hours and appointments together before connecting external calendars.</p>
        <div className="nb-availability-item"><span className="nb-source-icon"><Users size={19} /></span><div><strong>{data.facts.employees} team members</strong><p>Schedules are managed in Team</p></div><Link href="/employees">Review <ArrowUpRight size={12} /></Link></div>
        <div className="nb-availability-item"><span className="nb-source-icon"><CalendarDays size={19} /></span><div><strong>{data.facts.timezone}</strong><p>Your business timezone</p></div></div>
        <div className="nb-availability-note"><ShieldCheck size={18} /><div><strong>Your availability, your control</strong><p>Choose which provider to connect and review its permissions. External calendar sync requires a supported integration.</p></div></div>
      </section>
    </div>
    <section className="nb-card nb-calendar-protection"><ShieldCheck size={22} /><div><h2>Keep your schedule in sync</h2><p>NOVYA checks local appointment conflicts. Connect and verify an external provider before relying on its availability.</p></div><span className="nb-source-status">Local calendar ready</span></section>
    <div className="nb-footer">{continueButton}</div>
  </>;
}
