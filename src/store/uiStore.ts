import { create } from 'zustand';
import { loadSettings, saveSettings, type AppSettings } from '../lib/storage/storage';

export type ModalKind = 'settings' | 'repair' | 'openUrl' | 'import' | 'export' | 'diff-setup' | null;

export interface Toast {
  id: string;
  kind: 'success' | 'warning' | 'error' | 'info';
  message: string;
  action?: { label: string; onClick: () => void };
}

interface UiState {
  commandPaletteOpen: boolean;
  activeModal: ModalKind;
  searchOpen: boolean;
  diagnosticsOpen: boolean;
  toasts: Toast[];
  settings: AppSettings;
  mobileInspectorOpen: boolean;

  setCommandPaletteOpen: (open: boolean) => void;
  openModal: (modal: ModalKind) => void;
  closeModal: () => void;
  setSearchOpen: (open: boolean) => void;
  setDiagnosticsOpen: (open: boolean) => void;
  pushToast: (kind: Toast['kind'], message: string, action?: Toast['action']) => void;
  dismissToast: (id: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setMobileInspectorOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  commandPaletteOpen: false,
  activeModal: null,
  searchOpen: false,
  diagnosticsOpen: false,
  toasts: [],
  settings: loadSettings(),
  mobileInspectorOpen: false,

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setDiagnosticsOpen: (open) => set({ diagnosticsOpen: open }),

  pushToast: (kind, message, action) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set({ toasts: [...get().toasts, { id, kind, message, action }] });
    // Toasts carrying an action (e.g. "Review" on a broken-JSON warning) get
    // longer on screen — there's something to read and decide on, not just
    // acknowledge.
    setTimeout(() => get().dismissToast(id), action ? 6000 : 3200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  updateSettings: (patch) => {
    const next: AppSettings = {
      ...get().settings,
      ...patch,
      editor: { ...get().settings.editor, ...patch.editor },
      formatting: { ...get().settings.formatting, ...patch.formatting },
    };
    saveSettings(next);
    set({ settings: next });
  },
  setMobileInspectorOpen: (open) => set({ mobileInspectorOpen: open }),
}));
