export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded border border-border-strong bg-surface-3 text-[11px] font-mono text-text-muted">
      {children}
    </kbd>
  );
}
