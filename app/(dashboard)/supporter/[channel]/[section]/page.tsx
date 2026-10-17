import { notFound } from 'next/navigation';
import { OwnerSupporter } from '@/components/owner/supporter';
const sections: Record<string, string[]> = { 'ai-phone': ['voice', 'greeting', 'hours', 'appointments', 'forwarding', 'languages', 'knowledge', 'emergency'], 'whatsapp-ai': ['welcome', 'style', 'appointments', 'media', 'handover', 'availability', 'languages', 'knowledge', 'flow'] };
export default async function Page({ params }: { params: Promise<{ channel: string; section: string }> }) { const { channel, section } = await params; if (!sections[channel]?.includes(section)) notFound(); return <OwnerSupporter channel={channel === 'ai-phone' ? 'phone' : 'whatsapp'} section={section} />; }
