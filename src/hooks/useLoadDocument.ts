import { useCallback } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useUiStore } from '../store/uiStore';

/**
 * Every "open a document" entry point (paste, file upload, drag & drop,
 * open-from-URL, examples, recents) used to call `loadDocument` and then
 * unconditionally show a success toast — so pasting something broken looked
 * identical to pasting something clean, and the only sign anything was
 * wrong was the small status-bar text easy to miss. This wraps the load and
 * checks the result instead: same success toast when the document parses
 * cleanly, a warning with a one-click way into Repair mode when it doesn't.
 */
export function useLoadDocument() {
  const loadDocument = useWorkspaceStore((s) => s.loadDocument);
  const pushToast = useUiStore((s) => s.pushToast);
  const openModal = useUiStore((s) => s.openModal);

  return useCallback(
    (name: string, content: string, verb: string) => {
      loadDocument(name, content);

      // `setSource` (called by `loadDocument`) parses synchronously for all
      // but very large documents, so the fresh result is already in the
      // store right after this call — see workspaceStore.ts.
      const { isParsing, diagnostics } = useWorkspaceStore.getState();
      if (isParsing) {
        pushToast('info', `${verb} — parsing…`);
        return;
      }

      const actionable = diagnostics.filter((d) => d.severity !== 'info');
      if (actionable.length === 0) {
        pushToast('success', verb);
        return;
      }

      pushToast(
        'warning',
        `${verb} — JSON looks broken (${actionable.length} issue${actionable.length === 1 ? '' : 's'})`,
        { label: 'Review', onClick: () => openModal('repair') }
      );
    },
    [loadDocument, pushToast, openModal]
  );
}
