import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { useUiStore } from '../../store/uiStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { searchJson, type SearchTarget } from '../../lib/search/search';
import { pathKey } from '../../lib/json-path/path';

const TARGETS: { id: SearchTarget; label: string }[] = [
  { id: 'keys', label: 'Keys' },
  { id: 'values', label: 'Values' },
  { id: 'paths', label: 'Paths' },
];

export function SearchPanel() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const value = useWorkspaceStore((s) => s.value);
  const selectPath = useWorkspaceStore((s) => s.selectPath);
  const expandAll = useWorkspaceStore((s) => s.expandAll);
  const setViewMode = useWorkspaceStore((s) => s.setViewMode);

  const [query, setQuery] = useState('');
  const [targets, setTargets] = useState<SearchTarget[]>(['keys', 'values']);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => searchJson(value, { query, targets }), [value, query, targets]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, targets]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const goTo = (index: number) => {
    if (matches.length === 0) return;
    const wrapped = ((index % matches.length) + matches.length) % matches.length;
    setActiveIndex(wrapped);
    const match = matches[wrapped];
    const ancestorKeys: string[] = [];
    for (let i = 0; i <= match.path.length; i++) ancestorKeys.push(pathKey(match.path.slice(0, i)));
    expandAll(ancestorKeys);
    selectPath(match.path);
    setViewMode('tree');
  };

  if (!open) return null;

  return (
    <div className="absolute top-2 right-3 z-40 w-[360px] rounded-lg border border-border bg-surface shadow-2xl animate-slide-up">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Search size={14} className="text-text-faint shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.shiftKey) {
              e.preventDefault();
              goTo(activeIndex - 1);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              goTo(activeIndex + 1);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Search JSON…"
          className="flex-1 bg-transparent text-[13px] text-text placeholder:text-text-faint outline-none"
        />
        <button onClick={() => setOpen(false)} className="text-text-faint hover:text-text">
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
        <div className="flex items-center gap-1">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                setTargets((cur) => (cur.includes(t.id) ? cur.filter((x) => x !== t.id) : [...cur, t.id]))
              }
              className={clsx(
                'text-[11px] px-2 py-0.5 rounded-full border transition-colors',
                targets.includes(t.id)
                  ? 'border-accent/50 bg-accent-muted text-accent'
                  : 'border-border text-text-faint hover:text-text-muted'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {query && (
          <div className="flex items-center gap-1 text-[11px] text-text-faint">
            <span>{matches.length === 0 ? 'No matches' : `${activeIndex + 1} / ${matches.length}`}</span>
            <button onClick={() => goTo(activeIndex - 1)} className="hover:text-text p-0.5 disabled:opacity-30" disabled={!matches.length}>
              <ChevronUp size={12} />
            </button>
            <button onClick={() => goTo(activeIndex + 1)} className="hover:text-text p-0.5 disabled:opacity-30" disabled={!matches.length}>
              <ChevronDown size={12} />
            </button>
          </div>
        )}
      </div>

      {query && matches.length > 0 && (
        <div className="max-h-64 overflow-auto divide-y divide-border">
          {matches.slice(0, 100).map((m, i) => (
            <button
              key={`${m.pathString}-${i}`}
              onClick={() => goTo(i)}
              className={clsx('w-full text-left px-3 py-1.5 hover:bg-surface-2', i === activeIndex && 'bg-accent-muted')}
            >
              <div className="mono text-[11.5px] text-text-muted truncate">{m.pathString}</div>
              <div className="mono text-[11.5px] text-text truncate">{m.preview}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
