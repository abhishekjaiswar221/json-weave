import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

const icons = {
  success: <CheckCircle2 size={15} className="text-success shrink-0" />,
  warning: <AlertTriangle size={15} className="text-warning shrink-0" />,
  error: <XCircle size={15} className="text-danger shrink-0" />,
  info: <Info size={15} className="text-info shrink-0" />,
};

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      // Top-right, clear of the 48px top bar *and* the toolbar beneath it —
      // never over the editor, the details column, the view-mode tabs, or
      // the command palette (all lower z-index). The toolbar itself is
      // taller below `lg` (it stacks into two rows there — see
      // Toolbar.tsx), so the clearance below it grows to match.
      className="fixed top-34 lg:top-24 right-4 z-100 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-2 rounded-md border border-border bg-surface-2 px-3 py-2.5 shadow-lg animate-toast-in"
        >
          <span className="mt-0.5">{icons[t.kind]}</span>
          <span className="text-[12.5px] text-text flex-1 leading-snug">{t.message}</span>
          {t.action && (
            <button
              onClick={() => {
                t.action!.onClick();
                dismiss(t.id);
              }}
              className="shrink-0 text-[12px] font-medium text-accent-text hover:text-accent-hover"
            >
              {t.action.label}
            </button>
          )}
          <button onClick={() => dismiss(t.id)} className="shrink-0 text-text-faint hover:text-text" aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
