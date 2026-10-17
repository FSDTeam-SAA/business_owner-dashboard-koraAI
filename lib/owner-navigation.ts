import { Activity, CalendarDays, CheckSquare2, Inbox, LayoutGrid, ListChecks, Settings2, Sparkles, Users, Workflow } from "lucide-react";

// Business-owner navigation. Workspace is excluded from this dashboard.
export const ownerNavigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid, enabled: true, group: 0 },
  { href: "/assistant", label: "Assistant", icon: Sparkles, enabled: true, group: 0 },
  { href: "/live-view", label: "Live View", icon: Activity, enabled: true, group: 0 },
  { href: "/supporter", label: "Supporter", icon: Sparkles, enabled: true, group: 0 },
  { href: "/requests", label: "Requests", icon: ListChecks, enabled: true, group: 0 },
  { href: "/tasks", label: "Tasks", icon: CheckSquare2, enabled: true, group: 1 },
  { href: "/inbox", label: "Inbox", icon: Inbox, enabled: true, group: 1 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, enabled: true, group: 1 },
  { href: "/employees", label: "Team", icon: Users, enabled: true, group: 1 },
  { href: "/workflows", label: "Workflows", icon: Workflow, enabled: true, group: 1 },
];
export const settingsNavigation = { href: "/settings", label: "Settings", icon: Settings2 };
