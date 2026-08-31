export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded border border-border-strong bg-surface-3 text-[11px] font-mono text-text-muted">
      {children}
    </kbd>
  );
}

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent);
export const modKey = isMac ? '⌘' : 'Ctrl';
