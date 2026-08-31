import { useEffect, useState } from 'react';
import { useUiStore } from '../store/uiStore';

export function useThemeSync() {
  const theme = useUiStore((s) => s.settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);
}

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Resolves the app's `theme` setting ('dark' | 'light' | 'system') down to
 *  the actual 'dark' | 'light' currently in effect, tracking the OS setting
 *  live when the user has chosen 'system'. Consumers that can't rely on CSS
 *  alone (e.g. picking a Monaco theme object) use this instead of useThemeSync. */
export function useResolvedTheme(): 'dark' | 'light' {
  const theme = useUiStore((s) => s.settings.theme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => setSystemTheme(getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return theme === 'system' ? systemTheme : theme;
}
