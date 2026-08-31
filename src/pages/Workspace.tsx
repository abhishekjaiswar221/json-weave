import { useEffect, useRef } from 'react';
import '../lib/monacoSetup';
import { TopBar } from '../components/layout/TopBar';
import { Toolbar } from '../components/layout/Toolbar';
import { StatusBar } from '../components/layout/StatusBar';
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
import { setOpenFileTrigger } from '../lib/openFileBridge';

export default function Workspace() {
  const hasDocument = useWorkspaceStore((s) => s.hasDocument);
  const viewMode = useWorkspaceStore((s) => s.viewMode);
  const loadDocument = useWorkspaceStore((s) => s.loadDocument);
  const pushToast = useUiStore((s) => s.pushToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts();

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
      if (text) {
        loadDocument('pasted.json', text);
        pushToast('success', 'Pasted from clipboard');
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [hasDocument, loadDocument, pushToast]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      loadDocument(file.name, text);
      pushToast('success', `Loaded ${file.name}`);
    });
    e.target.value = '';
  };

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
            <div className="flex-1 min-w-0 border-r border-border">
              <JsonEditor />
            </div>
            <div className="w-[380px] shrink-0 flex flex-col">
              {viewMode === 'code' && <InspectorPanel />}
              {viewMode === 'tree' && (
                <>
                  <div className="flex-[1.3] min-h-0 border-b border-border">
                    <TreeView />
                  </div>
                  <div className="flex-1 min-h-0">
                    <InspectorPanel />
                  </div>
                </>
              )}
              {viewMode === 'overview' && <OverviewView />}
            </div>
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
