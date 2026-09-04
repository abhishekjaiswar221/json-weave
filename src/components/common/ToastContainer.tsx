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
      // Below md: top-center, dropping in like a native mobile banner —
      // bottom-right is cramped on a phone and shares the corner with the
      // floating Tree/Inspector button (bottom-16), and top banners are
      // the dominant mobile notification convention anyway. From md up:
      // bottom-right (clear of the 32px status bar), never over the
      // editor, the details column, the toolbar, or the command palette
      // (all lower z-index). Stack order is flipped between the two
      // (flex-col-reverse vs flex-col) so the newest toast is always the
      // one closest to wherever this is anchored, top or bottom.
      className="fixed z-100 flex flex-col-reverse md:flex-col gap-2 top-34 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-md md:top-auto md:left-auto md:translate-x-0 md:bottom-12 md:right-4 md:w-80 md:max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-2 rounded-md border border-border bg-surface-2 px-3 py-2.5 shadow-lg animate-slide-down md:animate-slide-up"
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
