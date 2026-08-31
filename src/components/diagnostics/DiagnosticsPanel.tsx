import { AlertTriangle, XCircle, Info, ArrowRight, X } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useUiStore } from '../../store/uiStore';
import clsx from 'clsx';

const severityIcon = {
  error: <XCircle size={14} className="text-danger shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />,
  info: <Info size={14} className="text-info shrink-0 mt-0.5" />,
};

export function DiagnosticsPanel() {
  const diagnostics = useWorkspaceStore((s) => s.diagnostics);
  const requestJump = useWorkspaceStore((s) => s.requestJump);
  const open = useUiStore((s) => s.diagnosticsOpen);
  const setOpen = useUiStore((s) => s.setDiagnosticsOpen);
  const openRepair = useUiStore((s) => s.openModal);

  if (!open) return null;

  const actionable = diagnostics.filter((d) => d.severity !== 'info');

  return (
    <div className="absolute bottom-9 right-3 z-40 w-95 max-h-[60vh] flex flex-col rounded-lg border border-border bg-surface shadow-2xl animate-slide-up">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
        <span className="text-[12.5px] font-medium text-text">
          {actionable.length === 0 ? 'No issues detected' : `${actionable.length} issue${actionable.length === 1 ? '' : 's'} detected`}
        </span>
        <button onClick={() => setOpen(false)} className="text-text-faint hover:text-text">
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-auto divide-y divide-border">
        {actionable.length === 0 && (
          <div className="px-3.5 py-6 text-center text-[12px] text-text-faint">JSON is valid — nothing to fix.</div>
        )}
        {actionable.map((d, i) => (
          <button
            key={i}
            onClick={() => requestJump(d.start.offset)}
            className="w-full flex items-start gap-2 px-3.5 py-2.5 text-left hover:bg-surface-2 transition-colors"
          >
            {severityIcon[d.severity]}
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] text-text leading-snug">{d.message}</p>
              <p className="mt-0.5 mono text-[11px] text-text-faint">
                Line {d.start.line} · Column {d.start.column}
              </p>
            </div>
            <ArrowRight size={13} className={clsx('shrink-0 mt-0.5 text-text-faint')} />
          </button>
        ))}
      </div>
      {actionable.length > 0 && (
        <div className="px-3.5 py-2.5 border-t border-border">
          <button
            onClick={() => {
              setOpen(false);
              openRepair('repair');
            }}
            className="w-full text-center text-[12px] font-medium text-accent hover:text-accent-hover"
          >
            Open Repair Mode →
          </button>
        </div>
      )}
    </div>
  );
}
