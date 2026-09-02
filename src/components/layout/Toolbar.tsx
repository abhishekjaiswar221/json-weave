import clsx from 'clsx';
import { WandSparkles, Minimize2, CheckCircle2, Wrench, Search as SearchIcon, ArrowDownAZ } from 'lucide-react';
import { useWorkspaceStore, type ViewMode } from '../../store/workspaceStore';
import { useUiStore } from '../../store/uiStore';
import { formatJson, minifyJson } from '../../lib/formatter/format';
import { buildRepairPreview } from '../../lib/repair/repair';
import { Button } from '../common/Button';
import { modKey } from '../../lib/platform';

const VIEW_TABS: { id: ViewMode; label: string }[] = [
  { id: 'code', label: 'Code' },
  { id: 'tree', label: 'Tree' },
  { id: 'overview', label: 'Overview' },
  { id: 'table', label: 'Table' },
  { id: 'diff', label: 'Diff' },
];

export function Toolbar() {
  const value = useWorkspaceStore((s) => s.value);
  const source = useWorkspaceStore((s) => s.source);
  const setSource = useWorkspaceStore((s) => s.setSource);
  const viewMode = useWorkspaceStore((s) => s.viewMode);
  const setViewMode = useWorkspaceStore((s) => s.setViewMode);

  const settings = useUiStore((s) => s.settings);
  const pushToast = useUiStore((s) => s.pushToast);
  const openModal = useUiStore((s) => s.openModal);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);

  const disabled = value === undefined;

  return (
    // Below `lg` there isn't room for both the action buttons and the view
    // tabs on one line (the two groups together run ~760px), so they stack
    // into two independently-scrollable rows instead of letting one of them
    // scroll off-screen with no indication it's there — the view tabs in
    // particular are the only way to switch views, and used to disappear
    // completely on phones and get clipped on tablets.
    <div className="shrink-0 border-b border-border bg-surface flex flex-col lg:flex-row lg:h-11 lg:items-center lg:justify-between lg:gap-3">
      <div className="h-11 px-2.5 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          title={`Format JSON (${modKey}+Shift+F)`}
          onClick={() => {
            if (value === undefined) return;
            setSource(formatJson(value, settings.formatting));
            pushToast('success', 'JSON formatted');
          }}
        >
          <WandSparkles size={13} /> Format
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          title={`Minify JSON (${modKey}+Shift+M)`}
          onClick={() => {
            if (value === undefined) return;
            setSource(minifyJson(value, { sortKeys: settings.formatting.sortKeys }));
            pushToast('success', 'JSON minified');
          }}
        >
          <Minimize2 size={13} /> Minify
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          title="Sort keys alphabetically"
          onClick={() => {
            if (value === undefined) return;
            setSource(formatJson(value, { ...settings.formatting, sortKeys: true }));
            pushToast('success', 'Keys sorted');
          }}
        >
          <ArrowDownAZ size={13} /> Sort keys
        </Button>
        <Button
          size="sm"
          variant="ghost"
          title="Validate JSON"
          onClick={() => {
            const preview = buildRepairPreview(source, settings.formatting.indent);
            if (preview.clean) pushToast('success', 'JSON is valid');
            else pushToast('warning', `${preview.issues.length} issue${preview.issues.length === 1 ? '' : 's'} detected`);
          }}
        >
          <CheckCircle2 size={13} /> Validate
        </Button>
        <Button size="sm" variant="ghost" title="Repair JSON" onClick={() => openModal('repair')}>
          <Wrench size={13} /> Repair
        </Button>
        <Button size="sm" variant="ghost" title={`Search JSON (${modKey}+F)`} onClick={() => setSearchOpen(true)}>
          <SearchIcon size={13} /> Search
        </Button>
      </div>

      <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface-2 p-0.5 mx-2.5 mb-2 lg:ml-0 lg:mr-2.5 lg:mb-0 overflow-x-auto no-scrollbar shrink-0 w-max max-w-[calc(100%-1.25rem)] lg:max-w-none">
        {VIEW_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setViewMode(t.id)}
            className={clsx(
              'px-2.5 h-6 rounded text-[12px] font-medium transition-colors whitespace-nowrap',
              viewMode === t.id ? 'bg-surface text-text shadow-sm' : 'text-text-faint hover:text-text-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
