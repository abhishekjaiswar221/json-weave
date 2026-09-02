import { useEffect, useRef } from 'react';
import '../lib/monacoSetup';
import { PanelRight, X } from 'lucide-react';
import clsx from 'clsx';
import { TopBar } from '../components/layout/TopBar';
import { Toolbar } from '../components/layout/Toolbar';
import { StatusBar } from '../components/layout/StatusBar';
import { ResizeHandle } from '../components/layout/ResizeHandle';
import { JsonEditor } from '../components/editor/JsonEditor';
import { InspectorPanel } from '../components/inspector/InspectorPanel';
import { TreeView } from '../components/tree/TreeView';
import { OverviewView } from '../components/overview/OverviewView';
import { TableView } from '../components/table/TableView';
import { DiffView } from '../components/diff/DiffView';
import { EmptyState } from '../components/landing/EmptyState';
import { CommandPalette } from '../components/command-palette/CommandPalette';
import { SearchPanel } from '../components/search/SearchPanel';
import { RepairModal } from '../components/repair/RepairModal';
import { SettingsModal } from '../components/settings/SettingsModal';
import { OpenUrlModal } from '../components/import/OpenUrlModal';
import { ToastContainer } from '../components/common/ToastContainer';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useUiStore } from '../store/uiStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLoadDocument } from '../hooks/useLoadDocument';
import { setOpenFileTrigger } from '../lib/openFileBridge';

function SidePanelContent({ viewMode }: { viewMode: 'code' | 'tree' | 'overview' }) {
  if (viewMode === 'overview') return <OverviewView />;
  if (viewMode === 'tree') {
    return (
      <>
        <div className="flex-[1.3] min-h-0 border-b border-border">
          <TreeView />
        </div>
        <div className="flex-1 min-h-0">
          <InspectorPanel />
        </div>
      </>
    );
  }
  return <InspectorPanel />;
}

export default function Workspace() {
  const hasDocument = useWorkspaceStore((s) => s.hasDocument);
  const viewMode = useWorkspaceStore((s) => s.viewMode);
  const docName = useWorkspaceStore((s) => s.docName);
  const loadDocument = useLoadDocument();
  const sidePanelWidth = useUiStore((s) => s.sidePanelWidth);
  const mobileInspectorOpen = useUiStore((s) => s.mobileInspectorOpen);
  const setMobileInspectorOpen = useUiStore((s) => s.setMobileInspectorOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts();
  useDocumentMeta(hasDocument ? `${docName} — JSONWeave` : 'JSONWeave — Understand your JSON, instantly', undefined, '/');

  useEffect(() => {
    setOpenFileTrigger(() => fileInputRef.current?.click());
    return () => setOpenFileTrigger(null);
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const active = document.activeElement;
      const inEditor = active?.closest('.monaco-editor') || active?.tagName === 'TEXTAREA' || active?.tagName === 'INPUT';
      if (inEditor || hasDocument) return;
      const text = e.clipboardData?.getData('text/plain');
      if (text) loadDocument('pasted.json', text, 'Pasted from clipboard');
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [hasDocument, loadDocument]);

  // close the mobile bottom sheet automatically when leaving a panel-backed view
  useEffect(() => {
    if (viewMode === 'table' || viewMode === 'diff') setMobileInspectorOpen(false);
  }, [viewMode, setMobileInspectorOpen]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => loadDocument(file.name, text, `Loaded ${file.name}`));
    e.target.value = '';
  };

  const isPanelView = viewMode === 'code' || viewMode === 'tree' || viewMode === 'overview';

  return (
    <div className="h-screen w-screen flex flex-col bg-canvas overflow-hidden">
      <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={onFileChange} />
      <TopBar />
      <Toolbar />

      <div className="flex-1 min-h-0 relative">
        {!hasDocument ? (
          <EmptyState />
        ) : viewMode === 'table' ? (
          <TableView />
        ) : viewMode === 'diff' ? (
          <DiffView />
        ) : (
          <div className="h-full flex">
            <div className="flex-1 min-w-0">
              <JsonEditor />
            </div>

            {/* Desktop: persistent, resizable side column. Mobile: bottom sheet, opened via the FAB. */}
            <ResizeHandle />
            <div className="hidden md:flex md:shrink-0 md:flex-col" style={{ width: sidePanelWidth }}>
              <SidePanelContent viewMode={viewMode} />
            </div>

            {isPanelView && (
              <button
                onClick={() => setMobileInspectorOpen(true)}
                className="md:hidden fixed bottom-16 right-4 z-30 flex items-center gap-1.5 rounded-full bg-accent text-accent-ink px-4 py-2.5 shadow-lg text-[12.5px] font-medium"
              >
                <PanelRight size={14} />
                {viewMode === 'tree' ? 'Tree' : viewMode === 'overview' ? 'Overview' : 'Inspector'}
              </button>
            )}

            {isPanelView && (
              <div
                className={clsx(
                  'md:hidden fixed inset-x-0 bottom-0 z-40 h-[72vh] rounded-t-xl border-t border-border bg-surface shadow-2xl flex flex-col transition-transform duration-200',
                  mobileInspectorOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
                )}
              >
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border shrink-0">
                  <span className="mono text-[11px] uppercase tracking-wide text-text-faint">
                    {viewMode === 'tree' ? 'Tree & Inspector' : viewMode === 'overview' ? 'Overview' : 'Inspector'}
                  </span>
                  <button onClick={() => setMobileInspectorOpen(false)} className="text-text-faint hover:text-text">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 min-h-0 flex flex-col">
                  <SidePanelContent viewMode={viewMode} />
                </div>
              </div>
            )}
          </div>
        )}

        <CommandPalette />
        <SearchPanel />
      </div>

      <StatusBar />

      <RepairModal />
      <SettingsModal />
      <OpenUrlModal />
      <ToastContainer />
    </div>
  );
}
