// All persistence is local-only (localStorage). Nothing here ever touches the network.

export interface RecentDocument {
  id: string;
  name: string;
  savedAt: number;
  size: number;
  /** small snippet only — full content is not retained to keep storage light & private */
  preview: string;
  content: string;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: 2 | 4;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  bracketMatching: boolean;
  ligatures: boolean;
}

export interface FormattingSettings {
  indent: 2 | 4 | 'tab';
  sortKeys: boolean;
  trailingNewline: boolean;
}

export type AppTheme = 'dark' | 'light' | 'system';

export interface AppSettings {
  editor: EditorSettings;
  formatting: FormattingSettings;
  theme: AppTheme;
}

export const DEFAULT_SETTINGS: AppSettings = {
  editor: {
    fontSize: 15,
    tabSize: 2,
    wordWrap: true,
    minimap: false,
    lineNumbers: true,
    bracketMatching: true,
    ligatures: true,
  },
  formatting: {
    indent: 2,
    sortKeys: false,
    trailingNewline: true,
  },
  theme: 'system',
};

const KEYS = {
  settings: 'jsonweave:settings',
  recents: 'jsonweave:recents',
  sidePanelWidth: 'jsonweave:sidePanelWidth',
};

/** Default/min/max for the draggable divider between the editor and the
 *  details column (Inspector/Tree/Overview) — see ResizeHandle.tsx. */
export const SIDE_PANEL_WIDTH = { default: 380, min: 280, max: 640 };

/** Bounds for the editor font size — the Settings field clamps to this range. */
export const FONT_SIZE = { default: 15, min: 10, max: 32 };

export function clampFontSize(px: number): number {
  return Math.min(FONT_SIZE.max, Math.max(FONT_SIZE.min, Math.round(px)));
}

const MAX_RECENTS = 12;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadSettings(): AppSettings {
  const stored = safeParse<Partial<AppSettings>>(localStorage.getItem(KEYS.settings), {});
  return {
    editor: { ...DEFAULT_SETTINGS.editor, ...stored.editor },
    formatting: { ...DEFAULT_SETTINGS.formatting, ...stored.formatting },
    theme: stored.theme ?? DEFAULT_SETTINGS.theme,
  };
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function loadRecents(): RecentDocument[] {
  return safeParse<RecentDocument[]>(localStorage.getItem(KEYS.recents), []);
}

export function addRecent(doc: Omit<RecentDocument, 'id' | 'savedAt' | 'preview'>): RecentDocument[] {
  const recents = loadRecents().filter((r) => r.name !== doc.name);
  const entry: RecentDocument = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: doc.name,
    savedAt: Date.now(),
    size: doc.size,
    preview: doc.content.slice(0, 400),
    content: doc.content.length <= 200_000 ? doc.content : doc.content.slice(0, 200_000),
  };
  const next = [entry, ...recents].slice(0, MAX_RECENTS);
  localStorage.setItem(KEYS.recents, JSON.stringify(next));
  return next;
}

export function removeRecent(id: string): RecentDocument[] {
  const next = loadRecents().filter((r) => r.id !== id);
  localStorage.setItem(KEYS.recents, JSON.stringify(next));
  return next;
}

export function clearRecents() {
  localStorage.removeItem(KEYS.recents);
}

export function loadSidePanelWidth(): number {
  const raw = Number(localStorage.getItem(KEYS.sidePanelWidth));
  if (!Number.isFinite(raw) || raw <= 0) return SIDE_PANEL_WIDTH.default;
  return Math.min(SIDE_PANEL_WIDTH.max, Math.max(SIDE_PANEL_WIDTH.min, raw));
}

export function saveSidePanelWidth(px: number) {
  localStorage.setItem(KEYS.sidePanelWidth, String(Math.round(px)));
}
