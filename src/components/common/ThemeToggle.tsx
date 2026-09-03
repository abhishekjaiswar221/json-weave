import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import type { AppTheme } from '../../lib/storage/storage';

const ORDER: AppTheme[] = ['system', 'light', 'dark'];
const ICONS: Record<AppTheme, typeof Sun> = { system: Monitor, light: Sun, dark: Moon };

/**
 * Compact three-state (System → Light → Dark → …) theme switcher. Discoverable
 * in the top bar without being visually loud — a single icon button, no
 * dropdown chrome. The Appearance tab in Settings offers the same three
 * options explicitly for anyone who wants to pick rather than cycle.
 *
 * The switch itself animates via the View Transitions API: a circular reveal
 * expanding from the button, in the spirit of Magic UI's animated theme
 * toggler. Falls back to an instant, unanimated change when the API isn't
 * supported or the user has requested reduced motion — never blocks the
 * actual theme change either way.
 */
export function ThemeToggle() {
  const theme = useUiStore((s) => s.settings.theme);
  const updateSettings = useUiStore((s) => s.updateSettings);
  const btnRef = useRef<HTMLButtonElement>(null);

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = ICONS[theme];

  const cycle = () => {
    const apply = () => updateSettings({ theme: next });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsViewTransition = typeof document.startViewTransition === 'function';

    if (reducedMotion || !supportsViewTransition || !btnRef.current) {
      apply();
      return;
    }

    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const root = document.documentElement;
    root.style.setProperty('--theme-toggle-x', `${left + width / 2}px`);
    root.style.setProperty('--theme-toggle-y', `${top + height / 2}px`);

    document.startViewTransition(() => {
      flushSync(apply);
    });
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={cycle}
      title={`Theme: ${theme} (click for ${next})`}
      aria-label={`Switch appearance, currently ${theme}`}
      className="h-8 w-8 shrink-0 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
    >
      <Icon size={14} />
    </button>
  );
}
