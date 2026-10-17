import { notFound } from 'next/navigation';
import { OwnerSupporter } from '@/components/owner/supporter';
export default async function Page({ params }: { params: Promise<{ channel: string }> }) { const { channel } = await params; if (!['ai-phone', 'whatsapp-ai'].includes(channel)) notFound(); return <OwnerSupporter channel={channel === 'ai-phone' ? 'phone' : 'whatsapp'} />; }
