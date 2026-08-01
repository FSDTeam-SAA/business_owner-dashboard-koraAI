"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type DashboardTheme = "Dark" | "Light";

const STORAGE_KEY = "kora-dashboard-theme";
const THEMES: DashboardTheme[] = ["Dark", "Light"];

type DashboardThemeContextValue = {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
};

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(null);

const normalizeTheme = (value?: string): DashboardTheme => {
  const text = String(value || "").toLowerCase();
  return text.includes("light") ? "Light" : "Dark";
};

function applyTheme(theme: DashboardTheme) {
  if (typeof document === "undefined") return;
  const value = theme.toLowerCase();
  document.documentElement.dataset.dashboardTheme = value;
  document.body.dataset.dashboardTheme = value;
}

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<DashboardTheme>("Dark");

  useEffect(() => {
    const storedTheme = normalizeTheme(window.localStorage.getItem(STORAGE_KEY) || "Dark");
    setThemeState(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const setTheme = useCallback((nextTheme: DashboardTheme) => {
    const normalized = normalizeTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, normalized);
    setThemeState(normalized);
    applyTheme(normalized);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <DashboardThemeContext.Provider value={value}>{children}</DashboardThemeContext.Provider>;
}

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (!context) {
    return {
      theme: "Dark" as DashboardTheme,
      setTheme: () => undefined,
    };
  }
  return context;
}

export { THEMES as DASHBOARD_THEMES, normalizeTheme as normalizeDashboardTheme };
