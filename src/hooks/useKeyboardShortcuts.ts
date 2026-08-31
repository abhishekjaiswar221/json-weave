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

      if (key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }
      if (key === 'o') {
        e.preventDefault();
        triggerOpenFile();
        return;
      }
      if (key === 'f' && !e.shiftKey) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (key === 's') {
        e.preventDefault();
        const { source, docName, saveToRecents } = useWorkspaceStore.getState();
        downloadText(docName, source);
        saveToRecents();
        pushToast('success', `Downloaded ${docName}`);
        return;
      }
      if (key === 'f' && e.shiftKey) {
        e.preventDefault();
        const { value, setSource } = useWorkspaceStore.getState();
        if (value === undefined) return;
        setSource(formatJson(value, useUiStore.getState().settings.formatting));
        pushToast('success', 'JSON formatted');
        return;
      }
      if (key === 'm' && e.shiftKey) {
        e.preventDefault();
        const { value, setSource } = useWorkspaceStore.getState();
        if (value === undefined) return;
        setSource(minifyJson(value));
        pushToast('success', 'JSON minified');
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setCommandPaletteOpen, setSearchOpen, pushToast]);
}
