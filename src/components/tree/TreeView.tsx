import { useMemo } from 'react';
import { ListTree, Maximize2, Minimize2 } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { TreeNode } from './TreeNode';
import { pathKey, appendIndex, appendKey, type JsonPath } from '../../lib/json-path/path';
import type { JsonValue } from '../../lib/parser/types';
import { Button } from '../common/Button';

function collectAllKeys(value: JsonValue, path: JsonPath, acc: string[]) {
  acc.push(pathKey(path));
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectAllKeys(v, appendIndex(path, i), acc));
  } else if (value !== null && typeof value === 'object') {
    for (const k of Object.keys(value)) collectAllKeys((value as Record<string, JsonValue>)[k], appendKey(path, k), acc);
  }
}

export function TreeView() {
  const value = useWorkspaceStore((s) => s.value);
  const expandAll = useWorkspaceStore((s) => s.expandAll);
  const collapseAll = useWorkspaceStore((s) => s.collapseAll);

  const allKeys = useMemo(() => {
    if (value === undefined) return [];
    const acc: string[] = [];
    collectAllKeys(value, [], acc);
    return acc;
  }, [value]);

  if (value === undefined) {
    return <div className="flex items-center justify-center h-full text-[13px] text-text-faint">Nothing to explore yet.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5 text-text-muted text-[12px]">
          <ListTree size={13} />
          <span>Tree</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => expandAll(allKeys)}>
            <Maximize2 size={12} /> Expand all
          </Button>
          <Button size="sm" variant="ghost" onClick={collapseAll}>
            <Minimize2 size={12} /> Collapse all
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <TreeNode label="root" value={value} path={[]} depth={0} />
      </div>
    </div>
  );
}
