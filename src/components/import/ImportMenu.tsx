import { type RefObject } from 'react';
import { Upload, ClipboardPaste, Link2, FileCode } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useLoadDocument } from '../../hooks/useLoadDocument';
import { useAnchoredPosition } from '../../hooks/useAnchoredPosition';
import { triggerOpenFile } from '../../lib/openFileBridge';
import { EXAMPLES } from '../../lib/examples';

const MENU_WIDTH = 224; // w-56

export function ImportMenu({ anchorRef, onClose }: { anchorRef: RefObject<HTMLElement | null>; onClose: () => void }) {
  const openModal = useUiStore((s) => s.openModal);
  const pushToast = useUiStore((s) => s.pushToast);
  const loadDocument = useLoadDocument();
  const pos = useAnchoredPosition(anchorRef, MENU_WIDTH);

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return pushToast('error', 'Clipboard is empty');
      loadDocument('pasted.json', text, 'Pasted from clipboard');
    } catch {
      pushToast('error', 'Could not read clipboard — try Ctrl/Cmd+V on the page instead');
    }
    onClose();
  };

  if (!pos) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      {/* Fixed + measured from the real trigger position (see
          useAnchoredPosition) rather than a plain CSS `right: 0` anchor —
          "Open" sits early in the top bar's button cluster, so a menu
          wider than the button would hang off the left edge on a narrow
          phone if it were simply right-aligned to it. This stays right
          under the button, clamped to the viewport, at every width. */}
      <div
        style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
        className="fixed z-50 rounded-lg border border-border bg-surface shadow-2xl py-1.5 animate-slide-up">
        <MenuItem icon={<Upload size={13} />} label="Upload file" onClick={() => { triggerOpenFile(); onClose(); }} />
        <MenuItem icon={<ClipboardPaste size={13} />} label="Paste JSON" onClick={pasteFromClipboard} />
        <MenuItem icon={<Link2 size={13} />} label="Open from URL" onClick={() => { openModal('openUrl'); onClose(); }} />
        <div className="my-1 border-t border-border" />
        <div className="px-3 py-1 text-[10.5px] uppercase tracking-wide text-text-faint">Examples</div>
        {EXAMPLES.map((ex) => (
          <MenuItem
            key={ex.name}
            icon={<FileCode size={13} />}
            label={ex.name}
            onClick={() => {
              loadDocument(ex.name, ex.content, `Loaded ${ex.name}`);
              onClose();
            }}
          />
        ))}
      </div>
    </>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-text hover:bg-surface-2 text-left">
      <span className="text-text-faint">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
