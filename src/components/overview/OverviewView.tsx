import { Braces, Brackets, Hash, ToggleLeft, Type, CircleSlash } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useUiStore } from '../../store/uiStore';
import { computeStats } from '../../lib/formatter/format';
import { appendIndex, appendKey } from '../../lib/json-path/path';
import type { JsonValue } from '../../lib/parser/types';

function typeOf(v: JsonValue): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function childSummary(v: JsonValue): string {
  if (Array.isArray(v)) return `${v.length} item${v.length === 1 ? '' : 's'}`;
  if (v !== null && typeof v === 'object') return `${Object.keys(v).length} key${Object.keys(v).length === 1 ? '' : 's'}`;
  return typeof v === 'string' ? `"${v.length > 40 ? v.slice(0, 40) + '…' : v}"` : String(v);
}

const statIcons: Record<string, React.ReactNode> = {
  objects: <Braces size={13} />,
  arrays: <Brackets size={13} />,
  strings: <Type size={13} />,
  numbers: <Hash size={13} />,
  booleans: <ToggleLeft size={13} />,
  nulls: <CircleSlash size={13} />,
};

export function OverviewView() {
  const value = useWorkspaceStore((s) => s.value);
  const selectPath = useWorkspaceStore((s) => s.selectPath);
  const setViewMode = useWorkspaceStore((s) => s.setViewMode);
  const expandAll = useWorkspaceStore((s) => s.expandAll);
  const pushToast = useUiStore((s) => s.pushToast);

  if (value === undefined) {
    return <div className="flex items-center justify-center h-full text-[13px] text-text-faint">Nothing to overview yet.</div>;
  }

  const stats = computeStats(value);
  const isBranch = Array.isArray(value) || (value !== null && typeof value === 'object');
  const entries = Array.isArray(value)
    ? value.map((v, i) => ({ label: `[${i}]`, value: v, path: appendIndex([], i) }))
    : value !== null && typeof value === 'object'
      ? Object.keys(value).map((k) => ({ label: k, value: (value as Record<string, JsonValue>)[k], path: appendKey([], k) }))
      : [];

  const goto = (path: (typeof entries)[number]['path']) => {
    selectPath(path);
    expandAll([path.map((p) => (p.type === 'index' ? `[${p.value}]` : `.${p.value}`)).join('')]);
    setViewMode('tree');
  };

  const copyPath = async (path: (typeof entries)[number]['path']) => {
    const { formatPath } = await import('../../lib/json-path/path');
    await navigator.clipboard.writeText(formatPath(path));
    pushToast('success', 'Copied path');
  };

  return (
    <div className="h-full overflow-auto p-5">
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(statIcons) as (keyof typeof statIcons)[]).map((k) => {
          const v = (stats as unknown as Record<string, number>)[k];
          if (!v) return null;
          return (
            <div key={k} className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1.5">
              <span className="text-text-faint">{statIcons[k]}</span>
              <span className="mono text-[12px] text-text">{v}</span>
              <span className="text-[11px] text-text-faint capitalize">{k}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1.5">
          <span className="mono text-[12px] text-text">{stats.maxDepth}</span>
          <span className="text-[11px] text-text-faint">max depth</span>
        </div>
      </div>

      <div className="mono text-[11px] uppercase tracking-widest text-text-faint mb-2">Root</div>

      {!isBranch && <div className="mono text-[13px] text-text">{childSummary(value)}</div>}

      {isBranch && (
        <div className="rounded-lg border border-border overflow-hidden">
          {entries.length === 0 && <div className="px-3.5 py-3 text-[12px] text-text-faint">Empty {typeOf(value)}</div>}
          {entries.map((e, i) => (
            <button
              key={e.label + i}
              onClick={() => goto(e.path)}
              onDoubleClick={() => copyPath(e.path)}
              title="Click to explore in tree · double-click to copy path"
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-left hover:bg-surface-2 border-b border-border last:border-b-0 group"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="mono text-[12.5px] text-text truncate">{e.label}</span>
                <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-surface-3 text-text-faint shrink-0">{typeOf(e.value)}</span>
              </span>
              <span className="mono text-[11.5px] text-text-faint truncate max-w-[45%]">{childSummary(e.value)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
