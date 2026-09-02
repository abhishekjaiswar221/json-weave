import { FolderOpen, ClipboardPaste, Link2, FileCode, Clock } from 'lucide-react';
import clsx from 'clsx';
import { LogoMark } from '../common/Logo';
import { Button } from '../common/Button';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useLoadDocument } from '../../hooks/useLoadDocument';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useUiStore } from '../../store/uiStore';
import { triggerOpenFile } from '../../lib/openFileBridge';
import { EXAMPLES } from '../../lib/examples';

export function EmptyState() {
  const loadDocument = useLoadDocument();
  const recents = useWorkspaceStore((s) => s.recents);
  const openModal = useUiStore((s) => s.openModal);
  const pushToast = useUiStore((s) => s.pushToast);

  const { isDragging, handlers } = useDragAndDrop((file) => {
    file.text().then((text) => loadDocument(file.name, text, `Loaded ${file.name}`));
  });

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return pushToast('error', 'Clipboard is empty');
      loadDocument('pasted.json', text, 'Pasted from clipboard');
    } catch {
      pushToast('error', 'Press Ctrl/Cmd+V on this page instead');
    }
  };

  return (
    <div
      {...handlers}
      className={clsx(
        'h-full flex flex-col items-center justify-center gap-5 px-6 border-2 border-dashed rounded-lg m-3 transition-colors',
        isDragging ? 'border-accent bg-accent-muted drop-active' : 'border-border'
      )}
    >
      <LogoMark size={40} />
      <div className="text-center">
        <h2 className="text-[15px] font-semibold text-text">Your JSON workspace</h2>
        <p className="mt-1 text-[12.5px] text-text-faint">Open a file, paste JSON, or drop it here.</p>
      </div>
      <Button variant="primary" onClick={triggerOpenFile}>
        <FolderOpen size={13} /> Open JSON
      </Button>
      <p className="text-[11.5px] text-text-faint">or drag &amp; drop a file</p>

      <div className="w-full max-w-xs border-t border-border pt-4 flex flex-col gap-1.5">
        <button onClick={pasteFromClipboard} className="flex items-center gap-2 text-[12.5px] text-text-muted hover:text-text px-2 py-1.5 rounded-md hover:bg-surface-2">
          <ClipboardPaste size={13} className="text-text-faint" /> Paste JSON
        </button>
        <button onClick={() => openModal('openUrl')} className="flex items-center gap-2 text-[12.5px] text-text-muted hover:text-text px-2 py-1.5 rounded-md hover:bg-surface-2">
          <Link2 size={13} className="text-text-faint" /> Open from URL
        </button>
        <button
          onClick={() => {
            const ex = EXAMPLES[0];
            loadDocument(ex.name, ex.content, `Loaded ${ex.name}`);
          }}
          className="flex items-center gap-2 text-[12.5px] text-text-muted hover:text-text px-2 py-1.5 rounded-md hover:bg-surface-2"
        >
          <FileCode size={13} className="text-text-faint" /> Try an example
        </button>
      </div>

      {recents.length > 0 && (
        <div className="w-full max-w-xs border-t border-border pt-4">
          <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[10.5px] uppercase tracking-wide text-text-faint">
            <Clock size={11} /> Recent
          </div>
          <div className="flex flex-col gap-0.5 max-h-32 overflow-auto">
            {recents.slice(0, 5).map((r) => (
              <button
                key={r.id}
                onClick={() => loadDocument(r.name, r.content, `Loaded ${r.name}`)}
                className="flex items-center justify-between gap-2 text-[12px] text-text-muted hover:text-text px-2 py-1 rounded-md hover:bg-surface-2 mono"
              >
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
