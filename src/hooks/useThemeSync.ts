import { useEffect } from 'react';
import { useUiStore } from '../store/uiStore';

export function useThemeSync() {
  const theme = useUiStore((s) => s.settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);
}
