"use client";

import { InboxWorkspace } from "@/components/inbox-workspace";
import { Suspense } from 'react';

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="ni-mail-empty">Loading inbox…</div>}><InboxWorkspace
      dashboardKey="business_owner"
      subtitle="Stay connected with your team and the sales partner who onboarded your business."
      recipientSearchPlaceholder="Search your employees or onboarding partner..."
      emptyConversationText="No conversations yet. Click + to start one with an employee or your onboarding sales partner."
      taskHref="/tasks"
    /></Suspense>
  );
}
