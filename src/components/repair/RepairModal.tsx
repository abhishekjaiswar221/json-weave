import { useMemo, useState } from 'react';
import { AlertTriangle, XCircle, Wand2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useUiStore } from '../../store/uiStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { buildRepairPreview } from '../../lib/repair/repair';

export function RepairModal() {
  const activeModal = useUiStore((s) => s.activeModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const pushToast = useUiStore((s) => s.pushToast);
  const formatting = useUiStore((s) => s.settings.formatting);
  const source = useWorkspaceStore((s) => s.source);
  const setSource = useWorkspaceStore((s) => s.setSource);
  const [showPreview, setShowPreview] = useState(false);

  const preview = useMemo(() => buildRepairPreview(source, formatting.indent), [source, formatting.indent]);

  if (activeModal !== 'repair') return null;

  const apply = () => {
    setSource(preview.repaired);
    pushToast('success', `Applied ${preview.issues.length} fix${preview.issues.length === 1 ? '' : 'es'}`);
    closeModal();
    setShowPreview(false);
  };

  return (
    <Modal open onClose={() => { closeModal(); setShowPreview(false); }} title="Repair JSON" description="Review proposed fixes before anything changes." width="max-w-2xl">
      {preview.clean ? (
        <div className="flex flex-col items-center text-center py-8 gap-2">
          <Wand2 size={20} className="text-success" />
          <p className="text-[13px] text-text">Nothing to repair — this document is already valid JSON.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-[12px] font-medium text-text-muted mb-2">Potential issues found ({preview.issues.length})</p>
            <div className="max-h-56 overflow-auto rounded-md border border-border divide-y divide-border">
              {preview.issues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => useWorkspaceStore.getState().requestJump(issue.diagnostic.start.offset)}
                  className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-surface-2"
                >
                  {issue.diagnostic.severity === 'error' ? (
                    <XCircle size={13} className="text-danger shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={13} className="text-warning shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-text">{issue.label}</p>
                    <p className="text-[11.5px] text-text-faint mono truncate">{issue.diagnostic.message}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {showPreview && (
            <div>
              <p className="text-[12px] font-medium text-text-muted mb-2">Preview after repair</p>
              <pre className="mono text-[11.5px] text-text bg-surface-3 rounded-md p-3 max-h-56 overflow-auto whitespace-pre-wrap break-all">
                {preview.repaired}
              </pre>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? 'Hide preview' : 'Preview fixes'}
            </Button>
            <Button variant="primary" onClick={apply}>
              Apply fixes
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
