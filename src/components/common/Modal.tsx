import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, description, children, width = 'max-w-lg' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(open, dialogRef);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Dialogs open from all over the app (toolbar, command palette, shortcuts)
  // without a natural first field to focus, so move focus to the dialog
  // itself — screen readers announce it immediately, and Tab from there
  // enters the trapped cycle above. But only when nothing *inside* the
  // dialog has already claimed focus (e.g. OpenUrlModal's autoFocus
  // input): that native autoFocus lands before this effect runs, and
  // unconditionally re-focusing the dialog here was yanking focus away
  // from it onto the non-editable dialog wrapper — any keystrokes typed
  // right as the modal opened were landing on nothing.
  useEffect(() => {
    if (open && dialogRef.current && !dialogRef.current.contains(document.activeElement)) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${width} rounded-lg border border-border bg-surface shadow-2xl animate-scale-in outline-none`}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 id={titleId} className="text-[14px] font-semibold text-text">{title}</h2>
            {description && <p className="mt-0.5 text-[12px] text-text-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-text-faint hover:text-text rounded-md p-1 hover:bg-surface-2 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
