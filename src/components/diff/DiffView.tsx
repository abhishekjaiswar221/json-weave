import { useMemo, useState } from 'react';
import { GitCompare, Upload } from 'lucide-react';
import clsx from 'clsx';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { parseTolerant } from '../../lib/parser/tolerantParser';
import { diffJson, summarizeDiff } from '../../lib/diff/diff';
import { Button } from '../common/Button';

function valueText(v: unknown): string {
  if (v === undefined) return '—';
  return JSON.stringify(v);
}

export function DiffView() {
  const source = useWorkspaceStore((s) => s.source);
  const value = useWorkspaceStore((s) => s.value);
  const [modifiedSource, setModifiedSource] = useState('');

  const modifiedValue = useMemo(() => parseTolerant(modifiedSource).value, [modifiedSource]);
  const entries = useMemo(() => (modifiedSource ? diffJson(value, modifiedValue) : []), [value, modifiedValue, modifiedSource]);
  const summary = useMemo(() => summarizeDiff(entries), [entries]);

  const loadFile = (file: File) => {
    file.text().then(setModifiedSource);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5 text-text-muted text-[12px]">
          <GitCompare size={13} />
          <span>Compare JSON</span>
        </div>
        {modifiedSource && (
          <div className="flex items-center gap-3 text-[11.5px] mono">
            <span className="text-success">+{summary.added}</span>
            <span className="text-danger">-{summary.removed}</span>
            <span className="text-warning">~{summary.changed}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-px bg-border h-[38%] shrink-0">
        <div className="bg-surface flex flex-col min-h-0">
          <div className="px-3 py-1.5 text-[11px] text-text-faint border-b border-border shrink-0">Original (current document)</div>
          <pre className="mono text-[11.5px] text-text-muted p-3 overflow-auto flex-1 whitespace-pre-wrap break-all">{source || 'Nothing loaded'}</pre>
        </div>
        <div className="bg-surface flex flex-col min-h-0">
          <div className="px-3 py-1.5 text-[11px] text-text-faint border-b border-border shrink-0 flex items-center justify-between">
            <span>Modified</span>
            <label className="flex items-center gap-1 text-accent hover:text-accent-hover cursor-pointer text-[11px]">
              <Upload size={11} /> Load file
              <input type="file" accept=".json,application/json" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
            </label>
          </div>
          <textarea
            value={modifiedSource}
            onChange={(e) => setModifiedSource(e.target.value)}
            placeholder="Paste JSON to compare against the original…"
            spellCheck={false}
            className="mono text-[11.5px] text-text bg-transparent p-3 flex-1 resize-none outline-none placeholder:text-text-faint"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {!modifiedSource && (
          <div className="h-full flex items-center justify-center text-[12.5px] text-text-faint">Paste or load a second document to compare.</div>
        )}
        {modifiedSource && entries.length === 0 && (
          <div className="h-full flex items-center justify-center text-[12.5px] text-success">Documents are semantically identical.</div>
        )}
        {entries.length > 0 && (
          <div className="divide-y divide-border">
            {entries.map((e, i) => (
              <div key={i} className="flex items-start gap-3 px-3.5 py-2">
                <span
                  className={clsx(
                    'mt-0.5 shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded',
                    e.kind === 'added' && 'bg-success/15 text-success',
                    e.kind === 'removed' && 'bg-danger/15 text-danger',
                    e.kind === 'changed' && 'bg-warning/15 text-warning'
                  )}
                >
                  {e.kind}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mono text-[11.5px] text-text-muted truncate">{e.pathString}</div>
                  <div className="mono text-[12px] flex items-center gap-2 flex-wrap">
                    {e.kind !== 'added' && <span className="text-danger line-through decoration-danger/60">{valueText(e.before)}</span>}
                    {e.kind === 'changed' && <span className="text-text-faint">→</span>}
                    {e.kind !== 'removed' && <span className="text-success">{valueText(e.after)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {!modifiedSource && (
        <div className="p-3 border-t border-border shrink-0">
          <Button size="sm" variant="secondary" onClick={() => document.getElementById('diff-file-input')?.click()}>
            <Upload size={12} /> Load a file to compare
          </Button>
          <input id="diff-file-input" type="file" accept=".json,application/json" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}
