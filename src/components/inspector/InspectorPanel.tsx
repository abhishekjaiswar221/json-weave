import { Copy, Info } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useUiStore } from '../../store/uiStore';
import { useResolvedTheme } from '../../hooks/useThemeSync';
import { formatPath, resolvePath } from '../../lib/json-path/path';
import { typeColorHex } from '../../lib/typeColor';
import type { JsonValue } from '../../lib/parser/types';
import { SmartValuePreview } from './ValuePreview';
import { Button } from '../common/Button';

function typeOf(v: JsonValue | undefined): string {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-wide text-text-faint mb-1">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export function InspectorPanel() {
  const value = useWorkspaceStore((s) => s.value);
  const selectedPath = useWorkspaceStore((s) => s.selectedPath);
  const pushToast = useUiStore((s) => s.pushToast);
  const resolvedTheme = useResolvedTheme();

  if (!selectedPath || value === undefined) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-2">
        <Info size={18} className="text-text-faint" />
        <p className="text-[12.5px] text-text-faint">Select a value in the editor or tree to inspect it.</p>
      </div>
    );
  }

  const selected = resolvePath(value, selectedPath);
  const type = typeOf(selected);
  const pathString = formatPath(selectedPath);
  const key = selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : null;
  const label = key ? (key.type === 'index' ? `[${key.value}]` : key.value) : 'root';

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      pushToast('success', `Copied ${what}`);
    } catch {
      pushToast('error', `Could not copy ${what}`);
    }
  };

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div>
        <div className="mono text-[13.5px] font-semibold text-text truncate">{label}</div>
        <button
          onClick={() => copy(pathString, 'path')}
          className="mt-1 flex items-center gap-1.5 mono text-[11.5px] text-text-muted hover:text-accent transition-colors group"
          title="Copy path"
        >
          <span className="truncate">{pathString}</span>
          <Copy size={11} className="shrink-0 opacity-0 group-hover:opacity-100" />
        </button>
      </div>

      <Row label="Type">
        <span
          className="mono text-[13px] font-medium"
          style={{ color: typeColorHex(type, resolvedTheme) ?? 'var(--color-text-faint)' }}
        >
          {type}
        </span>
      </Row>

      {type === 'string' && (
        <>
          <Row label="Value">
            <div className="mono text-[12.5px] text-text bg-surface-3 rounded-md p-2.5 break-all max-h-40 overflow-auto">
              {selected as string}
            </div>
            <SmartValuePreview value={selected as string} />
          </Row>
          <Row label="Length">
            <span className="mono text-[12.5px] text-text-muted">{(selected as string).length} characters</span>
          </Row>
        </>
      )}

      {type === 'number' && (
        <Row label="Value">
          <div className="mono text-[13px] text-text">{selected as number}</div>
        </Row>
      )}

      {type === 'boolean' && (
        <Row label="Value">
          <div className="mono text-[13px] text-text">{String(selected)}</div>
        </Row>
      )}

      {type === 'null' && (
        <Row label="Value">
          <div className="mono text-[13px] text-text-faint">null</div>
        </Row>
      )}

      {type === 'object' && (
        <Row label="Keys">
          <span className="mono text-[12.5px] text-text-muted">{Object.keys(selected as object).length} keys</span>
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.keys(selected as object).slice(0, 24).map((k) => (
              <span key={k} className="mono text-[11px] px-1.5 py-0.5 rounded bg-surface-3 text-text-muted">{k}</span>
            ))}
          </div>
        </Row>
      )}

      {type === 'array' && (
        <Row label="Items">
          <span className="mono text-[12.5px] text-text-muted">{(selected as JsonValue[]).length} items</span>
        </Row>
      )}

      <Row label="Actions">
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => copy(JSON.stringify(selected, null, 2), 'value')}>
            <Copy size={12} /> Copy value
          </Button>
          <Button size="sm" variant="secondary" onClick={() => copy(pathString, 'path')}>
            <Copy size={12} /> Copy path
          </Button>
        </div>
      </Row>
    </div>
  );
}
