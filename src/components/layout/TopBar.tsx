import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Download, Share2, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { useUiStore } from '../../store/uiStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { ImportMenu } from '../import/ImportMenu';
import { ExportMenu } from '../export/ExportMenu';

export function TopBar() {
  const openModal = useUiStore((s) => s.openModal);
  const pushToast = useUiStore((s) => s.pushToast);
  const docName = useWorkspaceStore((s) => s.docName);
  const source = useWorkspaceStore((s) => s.source);
  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);

  const share = async () => {
    if (!source) return pushToast('error', 'Nothing to share yet');
    await navigator.clipboard.writeText(source);
    pushToast('success', 'JSON copied to clipboard');
  };

  return (
    <div className="h-12 shrink-0 border-b border-border bg-surface px-3 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/" className="shrink-0">
          <Logo size={22} />
        </Link>
        <span className="text-border-strong">/</span>
        <span className="text-[13px] text-text-muted truncate">{docName}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Button size="sm" onClick={() => setOpenImport((v) => !v)}>
            <FolderOpen size={13} /> Open <ChevronDown size={11} />
          </Button>
          {openImport && <ImportMenu onClose={() => setOpenImport(false)} />}
        </div>
        <div className="relative">
          <Button size="sm" onClick={() => setOpenExport((v) => !v)}>
            <Download size={13} /> Save <ChevronDown size={11} />
          </Button>
          {openExport && <ExportMenu onClose={() => setOpenExport(false)} />}
        </div>
        <Button size="sm" variant="ghost" onClick={share} title="Copy JSON to clipboard">
          <Share2 size={13} /> Share
        </Button>
        <Button size="icon" variant="ghost" onClick={() => openModal('settings')} title="Settings">
          <SettingsIcon size={14} />
        </Button>
      </div>
    </div>
  );
}
