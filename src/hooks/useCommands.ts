import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore, type ViewMode } from '../store/workspaceStore';
import { useUiStore } from '../store/uiStore';
import { formatJson, minifyJson } from '../lib/formatter/format';
import { buildRepairPreview } from '../lib/repair/repair';
import { downloadText } from '../lib/download';
import { formatPath } from '../lib/json-path/path';
import { modKey } from '../lib/platform';

export interface Command {
  id: string;
  label: string;
  group: string;
  shortcut?: string;
  keywords?: string;
  run: () => void;
}

export function useCommands(): Command[] {
  const source = useWorkspaceStore((s) => s.source);
  const value = useWorkspaceStore((s) => s.value);
  const setSource = useWorkspaceStore((s) => s.setSource);
  const docName = useWorkspaceStore((s) => s.docName);
  const setViewMode = useWorkspaceStore((s) => s.setViewMode);
  const selectedPath = useWorkspaceStore((s) => s.selectedPath);
  const saveToRecents = useWorkspaceStore((s) => s.saveToRecents);

  const settings = useUiStore((s) => s.settings);
  const updateSettings = useUiStore((s) => s.updateSettings);
  const pushToast = useUiStore((s) => s.pushToast);
  const openModal = useUiStore((s) => s.openModal);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const navigate = useNavigate();

  return useMemo<Command[]>(() => {
    const setView = (mode: ViewMode) => {
      setViewMode(mode);
      pushToast('info', `Switched to ${mode[0].toUpperCase()}${mode.slice(1)} view`);
    };

    const commands: Command[] = [
      {
        id: 'format',
        label: 'Format JSON',
        group: 'Formatting',
        shortcut: `${modKey}+Shift+F`,
        run: () => {
          if (value === undefined) return pushToast('error', 'Nothing to format');
          setSource(formatJson(value, settings.formatting));
          pushToast('success', 'JSON formatted');
        },
      },
      {
        id: 'minify',
        label: 'Minify JSON',
        group: 'Formatting',
        shortcut: `${modKey}+Shift+M`,
        run: () => {
          if (value === undefined) return pushToast('error', 'Nothing to minify');
          setSource(minifyJson(value, { sortKeys: settings.formatting.sortKeys }));
          pushToast('success', 'JSON minified');
        },
      },
      {
        id: 'sort-keys',
        label: 'Sort keys alphabetically',
        group: 'Formatting',
        run: () => {
          if (value === undefined) return pushToast('error', 'Nothing to sort');
          setSource(formatJson(value, { ...settings.formatting, sortKeys: true }));
          pushToast('success', 'Keys sorted');
        },
      },
      {
        id: 'validate',
        label: 'Validate JSON',
        group: 'Formatting',
        run: () => {
          const preview = buildRepairPreview(source, settings.formatting.indent);
          if (preview.clean) pushToast('success', 'JSON is valid');
          else pushToast('warning', `${preview.issues.length} issue${preview.issues.length === 1 ? '' : 's'} detected`);
        },
      },
      {
        id: 'repair',
        label: 'Repair JSON…',
        group: 'Formatting',
        run: () => openModal('repair'),
      },
      {
        id: 'search',
        label: 'Search JSON',
        group: 'Navigate',
        shortcut: `${modKey}+F`,
        run: () => setSearchOpen(true),
      },
      { id: 'view-code', label: 'Toggle Code View', group: 'Navigate', run: () => setView('code') },
      { id: 'view-tree', label: 'Toggle Tree View', group: 'Navigate', run: () => setView('tree') },
      { id: 'view-overview', label: 'Toggle Overview', group: 'Navigate', run: () => setView('overview') },
      { id: 'view-table', label: 'Toggle Table View', group: 'Navigate', run: () => setView('table') },
      { id: 'view-diff', label: 'Compare JSON', group: 'Navigate', run: () => setView('diff') },
      {
        id: 'expand-all',
        label: 'Expand all nodes',
        group: 'Tree',
        run: () => {
          setView('tree');
        },
      },
      {
        id: 'copy-json',
        label: 'Copy JSON',
        group: 'Export',
        run: async () => {
          await navigator.clipboard.writeText(source);
          pushToast('success', 'Copied to clipboard');
        },
      },
      {
        id: 'copy-path',
        label: 'Copy Path',
        group: 'Export',
        run: async () => {
          if (!selectedPath) return pushToast('error', 'No node selected');
          await navigator.clipboard.writeText(formatPath(selectedPath));
          pushToast('success', 'Copied path');
        },
      },
      {
        id: 'download',
        label: 'Download JSON',
        group: 'Export',
        shortcut: `${modKey}+S`,
        run: () => {
          downloadText(docName, source);
          saveToRecents();
          pushToast('success', `Downloaded ${docName}`);
        },
      },
      {
        id: 'settings',
        label: 'Open Settings',
        group: 'App',
        run: () => openModal('settings'),
      },
      {
        id: 'theme-toggle',
        label: settings.theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme',
        group: 'App',
        run: () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' }),
      },
      {
        id: 'go-features',
        label: 'Go to Features & Shortcuts',
        group: 'App',
        keywords: 'about help docs',
        run: () => navigate('/features'),
      },
    ];

    return commands;
  }, [source, value, docName, settings, selectedPath, setSource, setViewMode, updateSettings, pushToast, openModal, setSearchOpen, saveToRecents, navigate]);
}
