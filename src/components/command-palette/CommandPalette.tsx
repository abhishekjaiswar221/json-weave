import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import clsx from 'clsx';
import { useUiStore } from '../../store/uiStore';
import { useCommands } from '../../hooks/useCommands';

export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const commands = useCommands();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => (c.label + ' ' + c.group + ' ' + (c.keywords ?? '')).toLowerCase().includes(q));
  }, [commands, query]);

  // Reset query/selection when the palette transitions closed -> open, and
  // reset the selection whenever the query changes — both derived during
  // render rather than in an effect (React coalesces this into one commit).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setActiveIndex(0);
  }

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  if (!open) return null;

  const run = (index: number) => {
    const cmd = filtered[index];
    if (!cmd) return;
    setOpen(false);
    cmd.run();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[16vh] px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-lg rounded-lg border border-border bg-surface shadow-2xl overflow-hidden animate-scale-in"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <Search size={15} className="text-text-faint shrink-0" />
          <input
            ref={inputRef}
            aria-label="Search commands"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                run(activeIndex);
              } else if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
            placeholder="Search commands…"
            className="flex-1 bg-transparent text-[14px] text-text placeholder:text-text-faint outline-none"
          />
        </div>
        <div className="max-h-80 overflow-auto py-1.5">
          {filtered.length === 0 && <div className="px-4 py-6 text-center text-[12.5px] text-text-faint">No matching commands</div>}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => run(i)}
              className={clsx(
                'w-full flex items-center justify-between gap-3 px-4 py-2 text-left',
                i === activeIndex ? 'bg-accent-muted' : 'hover:bg-surface-2'
              )}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className={clsx('text-[13px] truncate', i === activeIndex ? 'text-accent' : 'text-text')}>{cmd.label}</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                {cmd.shortcut && <span className="text-[10.5px] mono text-text-faint">{cmd.shortcut}</span>}
                {i === activeIndex && <CornerDownLeft size={12} className="text-accent" />}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
