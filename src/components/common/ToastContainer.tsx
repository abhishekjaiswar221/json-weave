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
      // Top-right, clear of the 48px top bar — never over the editor, the
      // details column, the toolbar, or the command palette (all lower z-index).
      className="fixed top-14 right-4 z-100 flex flex-col gap-2 w-75"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2.5 shadow-lg animate-toast-in"
        >
          {icons[t.kind]}
          <span className="text-[12.5px] text-text flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-text-faint hover:text-text">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
