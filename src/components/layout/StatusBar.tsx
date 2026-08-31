import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useUiStore } from '../../store/uiStore';
import { formatBytes, computeStats, countLines } from '../../lib/formatter/format';
import { DiagnosticsPanel } from '../diagnostics/DiagnosticsPanel';

export function StatusBar() {
  const source = useWorkspaceStore((s) => s.source);
  const value = useWorkspaceStore((s) => s.value);
  const diagnostics = useWorkspaceStore((s) => s.diagnostics);
  const isParsing = useWorkspaceStore((s) => s.isParsing);
  const diagnosticsOpen = useUiStore((s) => s.diagnosticsOpen);
  const setDiagnosticsOpen = useUiStore((s) => s.setDiagnosticsOpen);

  const actionable = diagnostics.filter((d) => d.severity !== 'info');
  const stats = computeStats(value);
  const bytes = formatBytes(new TextEncoder().encode(source).length);
  const lines = countLines(source);

  return (
    <div className="relative h-8 shrink-0 border-t border-border bg-surface px-3 flex items-center justify-between text-[11.5px] text-text-muted select-none">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setDiagnosticsOpen(!diagnosticsOpen)}
          className="flex items-center gap-1.5 hover:text-text transition-colors"
        >
          {isParsing ? (
            <span className="text-text-faint">Parsing…</span>
          ) : actionable.length === 0 ? (
            <>
              <CheckCircle2 size={12.5} className="text-success" />
              <span className="text-success">Valid JSON</span>
            </>
          ) : (
            <>
              <AlertTriangle size={12.5} className="text-warning" />
              <span className="text-warning">{actionable.length} issue{actionable.length === 1 ? '' : 's'}</span>
            </>
          )}
        </button>
        {source.length > 0 && (
          <>
            <span className="mono">{lines.toLocaleString()} lines</span>
            <span className="mono">{bytes}</span>
            {value !== undefined && (
              <>
                <span className="mono hidden md:inline">{stats.objects} objects</span>
                <span className="mono hidden md:inline">{stats.arrays} arrays</span>
              </>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-text-faint">
        <ShieldCheck size={12.5} />
        <span>Local</span>
      </div>
      <DiagnosticsPanel />
    </div>
  );
}
