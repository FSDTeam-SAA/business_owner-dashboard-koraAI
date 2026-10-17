'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useDashboardTheme, type DashboardTheme } from '@/lib/dashboard-theme';
import { useDashboardI18n, type DashboardLanguage } from '@/lib/dashboard-i18n';
import type { SettingsValue } from '@/lib/owner-settings';
import './settings-preferences.css';
export function OwnerSettingsPreferences() {
  const query = useQuery({ queryKey: ['owner-settings-preferences'], queryFn: () => api.get('/business/settings/preferences').then(r => r.data.data as Record<string, Record<string, SettingsValue>>), staleTime: 300_000, retry: false });
  const { setTheme } = useDashboardTheme(), { setLanguage } = useDashboardI18n();
  useEffect(() => {
    if (!query.data) return;
    const { appearance, accessibility, language } = query.data, root = document.documentElement;
    setTheme(appearance.theme as DashboardTheme); setLanguage(language.language as DashboardLanguage);
    root.dataset.ownerMotion = accessibility.reduceMotion || appearance.reduceMotion ? 'reduced' : 'full';
    root.dataset.ownerContrast = String(!!accessibility.highContrast);
    root.dataset.ownerUnderline = String(!!accessibility.underlineLinks);
    root.dataset.ownerDensity = String(appearance.density);
    root.style.setProperty('--owner-text-scale', `${Number(accessibility.textScale) / 100}`);
    return () => { delete root.dataset.ownerMotion; delete root.dataset.ownerContrast; delete root.dataset.ownerUnderline; delete root.dataset.ownerDensity; root.style.removeProperty('--owner-text-scale'); };
  }, [query.data, setTheme, setLanguage]);
  return null;
}
