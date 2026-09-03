import { useEffect } from 'react';
import { useUiStore } from '../store/uiStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { formatJson, minifyJson } from '../lib/formatter/format';
import { downloadText } from '../lib/download';
import { triggerOpenFile } from '../lib/openFileBridge';

export function useKeyboardShortcuts() {
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();

      // Captured at the window in the *capture* phase (see addEventListener
      // below), so this runs before the event ever reaches Monaco's own
      // keybinding service — Monaco treats bare Ctrl/Cmd+K as the first half
      // of a chord and silently swallows it otherwise, which is why the
      // palette used to appear to "not work" whenever the editor had focus.
      // stopPropagation keeps it that way regardless of what has focus:
      // editor, search input, settings fields, anywhere in the workspace.
      if (key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setCommandPaletteOpen(true);
        return;
      }
      if (key === 'o') {
        e.preventDefault();
        e.stopPropagation();
        triggerOpenFile();
        return;
      }
      if (key === 'f' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        setSearchOpen(true);
        return;
      }
      if (key === 's') {
        e.preventDefault();
        e.stopPropagation();
        const { source, docName, saveToRecents } = useWorkspaceStore.getState();
        downloadText(docName, source);
        saveToRecents();
        pushToast('success', `Downloaded ${docName}`);
        return;
      }
      if (key === 'f' && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const { value, setSource } = useWorkspaceStore.getState();
        if (value === undefined) return;
        setSource(formatJson(value, useUiStore.getState().settings.formatting));
        pushToast('success', 'JSON formatted');
        return;
      }
      if (key === 'm' && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const { value, setSource } = useWorkspaceStore.getState();
        if (value === undefined) return;
        setSource(minifyJson(value));
        pushToast('success', 'JSON minified');
        return;
      }
    };

    // capture: true — see comment above. This is what makes the shortcuts
    // authoritative over Monaco (and anything else) no matter where focus is.
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [setCommandPaletteOpen, setSearchOpen, pushToast]);
}
