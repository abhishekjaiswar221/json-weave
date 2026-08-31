import { create } from 'zustand';
import { parseTolerant } from '../lib/parser/tolerantParser';
import { parseInWorker, LARGE_DOC_THRESHOLD } from '../lib/parser/parseAsync';
import type { AstNode, Diagnostic, JsonValue } from '../lib/parser/types';
import type { JsonPath } from '../lib/json-path/path';
import { pathKey } from '../lib/json-path/path';
import { addRecent, loadRecents, removeRecent, type RecentDocument } from '../lib/storage/storage';

export type ViewMode = 'code' | 'tree' | 'overview' | 'table' | 'diff';

interface WorkspaceState {
  docName: string;
  source: string;
  ast: AstNode | undefined;
  value: JsonValue | undefined;
  diagnostics: Diagnostic[];
  strictlyValid: boolean;
  isParsing: boolean;
  viewMode: ViewMode;
  selectedPath: JsonPath | null;
  expandedPaths: Set<string>;
  jumpToOffset: number | null;
  recents: RecentDocument[];
  hasDocument: boolean;
  parseSeq: number;

  setSource: (source: string, opts?: { silent?: boolean }) => void;
  loadDocument: (name: string, content: string) => void;
  newDocument: () => void;
  setViewMode: (mode: ViewMode) => void;
  selectPath: (path: JsonPath | null) => void;
  togglePath: (key: string) => void;
  expandAll: (keys: string[]) => void;
  collapseAll: () => void;
  requestJump: (offset: number) => void;
  clearJump: () => void;
  refreshRecents: () => void;
  deleteRecent: (id: string) => void;
  saveToRecents: () => void;
}

function keyFor(path: JsonPath) {
  return pathKey(path);
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  docName: 'untitled.json',
  source: '',
  ast: undefined,
  value: undefined,
  diagnostics: [],
  strictlyValid: true,
  isParsing: false,
  viewMode: 'code',
  selectedPath: null,
  expandedPaths: new Set<string>(['']),
  jumpToOffset: null,
  recents: loadRecents(),
  hasDocument: false,
  parseSeq: 0,

  setSource: (source, opts) => {
    const seq = get().parseSeq + 1;
    set({ source, parseSeq: seq, hasDocument: source.length > 0 || get().hasDocument });

    if (source.length > LARGE_DOC_THRESHOLD) {
      set({ isParsing: true, ast: undefined });
      parseInWorker(source).then((r) => {
        if (get().parseSeq !== seq) return; // stale
        set({ value: r.value, diagnostics: r.diagnostics, strictlyValid: r.strictlyValid, isParsing: false });
      });
      return;
    }

    const result = parseTolerant(source);
    set({ ast: result.ast, value: result.value, diagnostics: result.diagnostics, strictlyValid: result.strictlyValid, isParsing: false });
    void opts;
  },

  loadDocument: (name, content) => {
    set({ docName: name, selectedPath: null, expandedPaths: new Set(['']) });
    get().setSource(content);
  },

  newDocument: () => {
    set({ docName: 'untitled.json', selectedPath: null, expandedPaths: new Set(['']) });
    get().setSource('');
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  selectPath: (path) => set({ selectedPath: path }),

  togglePath: (key) =>
    set((s) => {
      const next = new Set(s.expandedPaths);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { expandedPaths: next };
    }),

  expandAll: (keys) => set((s) => ({ expandedPaths: new Set([...s.expandedPaths, ...keys]) })),
  collapseAll: () => set({ expandedPaths: new Set(['']) }),

  requestJump: (offset) => set({ jumpToOffset: offset }),
  clearJump: () => set({ jumpToOffset: null }),

  refreshRecents: () => set({ recents: loadRecents() }),
  deleteRecent: (id) => set({ recents: removeRecent(id) }),

  saveToRecents: () => {
    const { docName, source } = get();
    const recents = addRecent({ name: docName, size: new TextEncoder().encode(source).length, content: source });
    set({ recents });
  },
}));

export { keyFor };
