import { memo, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { JsonValue } from '../../lib/parser/types';
import { appendIndex, appendKey, pathKey, type JsonPath } from '../../lib/json-path/path';
import { useWorkspaceStore } from '../../store/workspaceStore';

const CHUNK = 150;

function typeOf(v: JsonValue): 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v as 'string' | 'number' | 'boolean' | 'object';
}

function inlinePreview(v: JsonValue): { text: string; className: string } {
  const t = typeOf(v);
  switch (t) {
    case 'string':
      return { text: `"${v}"`, className: 'text-[#50FA7B]' };
    case 'number':
      return { text: String(v), className: 'text-[#BD93F9]' };
    case 'boolean':
      return { text: String(v), className: 'text-[#FFB86C]' };
    case 'null':
      return { text: 'null', className: 'text-[#FF79C6]' };
    case 'array':
      return { text: `Array(${(v as JsonValue[]).length})`, className: 'text-text-faint' };
    case 'object':
      return { text: `Object(${Object.keys(v as object).length})`, className: 'text-text-faint' };
  }
}

interface TreeNodeProps {
  label: string;
  value: JsonValue;
  path: JsonPath;
  depth: number;
  isLast?: boolean;
}

export const TreeNode = memo(function TreeNode({ label, value, path, depth }: TreeNodeProps) {
  const key = pathKey(path);
  const expanded = useWorkspaceStore((s) => s.expandedPaths.has(key));
  const toggle = useWorkspaceStore((s) => s.togglePath);
  const selectedKey = useWorkspaceStore((s) => (s.selectedPath ? pathKey(s.selectedPath) : ''));
  const selectPath = useWorkspaceStore((s) => s.selectPath);
  const [visibleCount, setVisibleCount] = useState(CHUNK);

  const type = typeOf(value);
  const isBranch = type === 'object' || type === 'array';
  const isSelected = selectedKey === key;

  const entries = useMemo(() => {
    if (type === 'array') return (value as JsonValue[]).map((v, i) => ({ label: `${i}`, value: v, path: appendIndex(path, i) }));
    if (type === 'object') {
      const obj = value as Record<string, JsonValue>;
      return Object.keys(obj).map((k) => ({ label: k, value: obj[k], path: appendKey(path, k) }));
    }
    return [];
  }, [type, value, path]);

  const preview = !isBranch ? inlinePreview(value) : null;

  return (
    <div>
      <div
        role="treeitem"
        tabIndex={0}
        onClick={() => {
          selectPath(path);
          if (isBranch) toggle(key);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectPath(path);
            if (isBranch) toggle(key);
          }
        }}
        className={clsx(
          'group flex items-center gap-1.5 rounded-md px-1.5 py-[3px] cursor-pointer select-none outline-none',
          'hover:bg-surface-2 focus-visible:ring-1 focus-visible:ring-accent',
          isSelected && 'bg-accent-muted'
        )}
        style={{ paddingLeft: depth * 16 + 6 }}
      >
        {isBranch ? (
          <ChevronRight
            size={13}
            className={clsx('shrink-0 text-text-faint transition-transform duration-150', expanded && 'rotate-90')}
          />
        ) : (
          <span className="w-[13px] shrink-0" />
        )}
        <span className="mono text-[12.5px] text-text-muted">{label}</span>
        {isBranch ? (
          <span className="mono text-[11.5px] text-text-faint">
            {type === 'array' ? `Array(${(value as JsonValue[]).length})` : `Object(${Object.keys(value as object).length})`}
          </span>
        ) : (
          <span className={clsx('mono text-[12.5px] truncate', preview!.className)}>{preview!.text}</span>
        )}
      </div>

      {isBranch && expanded && (
        <div role="group">
          {entries.slice(0, visibleCount).map((e) => (
            <TreeNode key={e.label} label={e.label} value={e.value} path={e.path} depth={depth + 1} />
          ))}
          {entries.length > visibleCount && (
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                setVisibleCount((c) => c + CHUNK);
              }}
              style={{ paddingLeft: (depth + 1) * 16 + 24 }}
              className="text-[11.5px] mono text-accent hover:text-accent-hover py-1"
            >
              Show {Math.min(CHUNK, entries.length - visibleCount)} more of {entries.length - visibleCount}…
            </button>
          )}
          {entries.length === 0 && (
            <div style={{ paddingLeft: (depth + 1) * 16 + 24 }} className="text-[11.5px] text-text-faint py-1">
              empty {type}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
