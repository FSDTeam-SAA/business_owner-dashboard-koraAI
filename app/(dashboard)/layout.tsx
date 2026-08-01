import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavProvider } from "@/components/layout/mobile-nav-context";
import { AuthSessionGate } from "@/components/auth-session-gate";
import { DashboardI18nProvider } from "@/lib/dashboard-i18n";
import { DashboardThemeProvider } from "@/lib/dashboard-theme";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionGate>
      <DashboardThemeProvider>
        <DashboardI18nProvider>
          <MobileNavProvider>
            <div className="flex h-dvh overflow-hidden bg-[#050d1a]">
              <Sidebar />
              <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
              </main>
            </div>
          </MobileNavProvider>
        </DashboardI18nProvider>
      </DashboardThemeProvider>
    </AuthSessionGate>
  );
}
