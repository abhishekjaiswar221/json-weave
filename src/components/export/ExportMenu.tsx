import { Download, Copy, FileSpreadsheet, FileText } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { downloadText } from '../../lib/download';
import { jsonToCsv, jsonToYaml, canRenderAsTable } from '../../lib/convert/convert';

export function ExportMenu({ onClose }: { onClose: () => void }) {
  const pushToast = useUiStore((s) => s.pushToast);
  const source = useWorkspaceStore((s) => s.source);
  const value = useWorkspaceStore((s) => s.value);
  const docName = useWorkspaceStore((s) => s.docName);
  const saveToRecents = useWorkspaceStore((s) => s.saveToRecents);

  const baseName = docName.replace(/\.json$/i, '');

  const run = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      pushToast('error', (e as Error).message);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      {/* Fixed to the viewport's top-right rather than anchored to the trigger
          button — see ImportMenu.tsx for why. */}
      <div className="fixed top-14 right-3 sm:right-4 z-50 w-56 max-w-[calc(100vw-1.5rem)] rounded-lg border border-border bg-surface shadow-2xl py-1.5 animate-slide-up">
        <Item
          icon={<Download size={13} />}
          label="Download JSON"
          onClick={() =>
            run(() => {
              downloadText(docName, source);
              saveToRecents();
              pushToast('success', `Downloaded ${docName}`);
            })
          }
        />
        <Item
          icon={<Copy size={13} />}
          label="Copy JSON"
          onClick={() =>
            run(async () => {
              await navigator.clipboard.writeText(source);
              pushToast('success', 'Copied to clipboard');
            })
          }
        />
        <div className="my-1 border-t border-border" />
        <Item
          icon={<FileText size={13} />}
          label="Export as YAML"
          onClick={() =>
            run(() => {
              if (value === undefined) throw new Error('Nothing to export');
              downloadText(`${baseName}.yaml`, jsonToYaml(value), 'text/yaml');
              pushToast('success', `Downloaded ${baseName}.yaml`);
            })
          }
        />
        <Item
          icon={<FileSpreadsheet size={13} />}
          label="Export as CSV"
          disabled={!canRenderAsTable(value)}
          onClick={() =>
            run(() => {
              if (!canRenderAsTable(value)) throw new Error('CSV export needs an array of objects');
              downloadText(`${baseName}.csv`, jsonToCsv(value), 'text/csv');
              pushToast('success', `Downloaded ${baseName}.csv`);
            })
          }
        />
      </div>
    </>
  );
}

function Item({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-text hover:bg-surface-2 text-left disabled:opacity-35 disabled:pointer-events-none"
    >
      <span className="text-text-faint">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
