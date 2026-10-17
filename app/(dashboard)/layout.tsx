import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavProvider } from "@/components/layout/mobile-nav-context";
import { AuthSessionGate } from "@/components/auth-session-gate";
import { DashboardI18nProvider } from "@/lib/dashboard-i18n";
import { DashboardThemeProvider } from "@/lib/dashboard-theme";
import { KoraDrawerProvider } from "@/components/owner/kora-drawer";
import { OwnerSettingsPreferences } from "@/components/owner/settings-preferences";
import "./owner.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionGate>
      <DashboardThemeProvider>
        <DashboardI18nProvider>
          <MobileNavProvider>
            <OwnerSettingsPreferences />
            <KoraDrawerProvider>
            <div className="nv-shell">
              <Sidebar />
              <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
              </main>
            </div>
            </KoraDrawerProvider>
          </MobileNavProvider>
        </DashboardI18nProvider>
      </DashboardThemeProvider>
    </AuthSessionGate>
  );
}
