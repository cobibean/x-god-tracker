'use client';

import { useEffect } from 'react';
import { getThemeVarsFor } from '@/lib/theme-utils';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const apply = () => {
    try {
      const raw = localStorage.getItem('appearance-settings');
      const s = raw ? JSON.parse(raw) : { theme: 'system', primaryColor: 'blue', compactMode: false, animations: true };
      const root = document.documentElement;

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = s.theme === 'dark' || (s.theme === 'system' && prefersDark);
      root.classList.toggle('dark', isDark);

      const { primary, primaryFg } = getThemeVarsFor(s.primaryColor);
      root.style.setProperty('--primary', primary);
      root.style.setProperty('--primary-foreground', primaryFg);

      root.classList.toggle('compact', !!s.compactMode);
      root.classList.toggle('no-animations', !s.animations);
    } catch {}
  };

  useEffect(apply, []);
  useEffect(() => {
    const on = () => apply();
    window.addEventListener('appearanceUpdated', on);
    return () => window.removeEventListener('appearanceUpdated', on);
  }, []);

  return <>{children}</>;
}


