import { useMemo } from 'react';
import { Table2 } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { canRenderAsTable } from '../../lib/convert/convert';
import type { JsonValue } from '../../lib/parser/types';
import { appendIndex, appendKey } from '../../lib/json-path/path';

function cellText(v: JsonValue | undefined): string {
  if (v === undefined) return '';
  if (v === null) return 'null';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function TableView() {
  const value = useWorkspaceStore((s) => s.value);
  const selectPath = useWorkspaceStore((s) => s.selectPath);

  const columns = useMemo(() => {
    if (!canRenderAsTable(value)) return [];
    const cols: string[] = [];
    for (const row of value) {
      for (const key of Object.keys(row)) if (!cols.includes(key)) cols.push(key);
    }
    return cols;
  }, [value]);

  if (!canRenderAsTable(value)) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-6">
        <Table2 size={18} className="text-text-faint" />
        <p className="text-[12.5px] text-text-faint">
          Table view works for an array of objects — this document isn't shaped that way.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead className="sticky top-0 bg-surface-2 z-10">
          <tr>
            <th className="text-left px-3 py-2 font-medium text-text-faint border-b border-r border-border w-12">#</th>
            {columns.map((c) => (
              <th key={c} className="text-left px-3 py-2 font-medium text-text-muted border-b border-border mono whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value.map((row, i) => (
            <tr key={i} className="hover:bg-surface-2/60">
              <td
                className="px-3 py-1.5 text-text-faint border-b border-r border-border mono cursor-pointer"
                onClick={() => selectPath(appendIndex([], i))}
              >
                {i}
              </td>
              {columns.map((c) => (
                <td
                  key={c}
                  className="px-3 py-1.5 border-b border-border mono text-text whitespace-nowrap max-w-[280px] overflow-hidden text-ellipsis cursor-pointer"
                  onClick={() => selectPath(appendKey(appendIndex([], i), c))}
                  title={cellText(row[c])}
                >
                  {cellText(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
