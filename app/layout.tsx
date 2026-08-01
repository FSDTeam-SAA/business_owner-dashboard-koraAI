import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "KoraAI - Business Dashboard",
  description: "KoraAI Business Owner Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-[#050d1a] text-gray-200" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('kora-dashboard-theme');var v=t&&t.toLowerCase().indexOf('light')>-1?'light':'dark';document.documentElement.dataset.dashboardTheme=v;document.body.dataset.dashboardTheme=v;}catch(e){}",
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
