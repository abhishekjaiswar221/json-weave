import { useState } from 'react';
import clsx from 'clsx';
import { ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useUiStore } from '../../store/uiStore';
import { FONT_SIZE, clampFontSize, type AppTheme } from '../../lib/storage/storage';
import { modKey } from '../../lib/platform';

type Tab = 'editor' | 'formatting' | 'appearance' | 'privacy';
const TABS: { id: Tab; label: string }[] = [
  { id: 'editor', label: 'Editor' },
  { id: 'formatting', label: 'Formatting' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'privacy', label: 'Privacy' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'inline-flex h-5 w-9 shrink-0 items-center rounded-full border p-0.5 transition-colors',
        checked ? 'bg-accent border-accent' : 'bg-surface-3 border-border-strong'
      )}
    >
      <span className={clsx('h-4 w-4 rounded-full bg-white shadow-sm transition-transform', checked ? 'translate-x-[14px]' : 'translate-x-0')} />
    </button>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[12.5px] text-text">{label}</span>
      {children}
    </div>
  );
}

const selectClass = 'h-7 px-2 rounded-md border border-border-strong bg-surface-3 text-[12px] text-text outline-none focus:border-accent';

export function SettingsModal() {
  const activeModal = useUiStore((s) => s.activeModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const settings = useUiStore((s) => s.settings);
  const updateSettings = useUiStore((s) => s.updateSettings);
  const [tab, setTab] = useState<Tab>('editor');

  if (activeModal !== 'settings') return null;

  return (
    <Modal open onClose={closeModal} title="Settings" width="max-w-xl">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
        <div className="flex gap-0.5 overflow-x-auto no-scrollbar border-b border-border pb-2 sm:w-32 sm:shrink-0 sm:flex-col sm:border-b-0 sm:pb-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'shrink-0 whitespace-nowrap text-left text-[12.5px] px-2.5 py-1.5 rounded-md',
                tab === t.id ? 'bg-accent-muted text-accent' : 'text-text-muted hover:bg-surface-2'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 divide-y divide-border">
          {tab === 'editor' && (
            <>
              <FieldRow label="Font size">
                <input
                  type="number"
                  min={FONT_SIZE.min}
                  max={FONT_SIZE.max}
                  value={settings.editor.fontSize}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) updateSettings({ editor: { ...settings.editor, fontSize: n } });
                  }}
                  onBlur={(e) =>
                    updateSettings({ editor: { ...settings.editor, fontSize: clampFontSize(Number(e.target.value) || FONT_SIZE.default) } })
                  }
                  className={clsx(selectClass, 'w-16 text-right')}
                />
              </FieldRow>
              <FieldRow label={`Zoom with ${modKey} + Scroll`}>
                <Toggle
                  checked={settings.editor.mouseWheelZoom}
                  onChange={(v) => updateSettings({ editor: { ...settings.editor, mouseWheelZoom: v } })}
                />
              </FieldRow>
              <FieldRow label="Tab size">
                <select
                  className={selectClass}
                  value={settings.editor.tabSize}
                  onChange={(e) => updateSettings({ editor: { ...settings.editor, tabSize: Number(e.target.value) as 2 | 4 } })}
                >
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                </select>
              </FieldRow>
              <FieldRow label="Word wrap">
                <Toggle checked={settings.editor.wordWrap} onChange={(v) => updateSettings({ editor: { ...settings.editor, wordWrap: v } })} />
              </FieldRow>
              <FieldRow label="Minimap">
                <Toggle checked={settings.editor.minimap} onChange={(v) => updateSettings({ editor: { ...settings.editor, minimap: v } })} />
              </FieldRow>
              <FieldRow label="Line numbers">
                <Toggle checked={settings.editor.lineNumbers} onChange={(v) => updateSettings({ editor: { ...settings.editor, lineNumbers: v } })} />
              </FieldRow>
              <FieldRow label="Bracket matching">
                <Toggle checked={settings.editor.bracketMatching} onChange={(v) => updateSettings({ editor: { ...settings.editor, bracketMatching: v } })} />
              </FieldRow>
              <FieldRow label="Font ligatures">
                <Toggle checked={settings.editor.ligatures} onChange={(v) => updateSettings({ editor: { ...settings.editor, ligatures: v } })} />
              </FieldRow>
            </>
          )}

          {tab === 'formatting' && (
            <>
              <FieldRow label="Indentation">
                <select
                  className={selectClass}
                  value={String(settings.formatting.indent)}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateSettings({ formatting: { ...settings.formatting, indent: v === 'tab' ? 'tab' : (Number(v) as 2 | 4) } });
                  }}
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                  <option value="tab">Tab</option>
                </select>
              </FieldRow>
              <FieldRow label="Sort keys on format">
                <Toggle checked={settings.formatting.sortKeys} onChange={(v) => updateSettings({ formatting: { ...settings.formatting, sortKeys: v } })} />
              </FieldRow>
              <FieldRow label="Trailing newline">
                <Toggle checked={settings.formatting.trailingNewline} onChange={(v) => updateSettings({ formatting: { ...settings.formatting, trailingNewline: v } })} />
              </FieldRow>
            </>
          )}

          {tab === 'appearance' && (
            <div className="py-2 flex gap-2">
              {(['dark', 'light', 'system'] as AppTheme[]).map((th) => (
                <button
                  key={th}
                  onClick={() => updateSettings({ theme: th })}
                  className={clsx(
                    'flex-1 rounded-md border px-3 py-2 text-[12px] capitalize',
                    settings.theme === th ? 'border-accent text-accent bg-accent-muted' : 'border-border text-text-muted hover:bg-surface-2'
                  )}
                >
                  {th}
                </button>
              ))}
            </div>
          )}

          {tab === 'privacy' && (
            <div className="py-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-text">Local processing</span>
                <span className="flex items-center gap-1.5 text-[11.5px] text-success">
                  <ShieldCheck size={13} /> Always on
                </span>
              </div>
              <p className="text-[12px] text-text-muted leading-relaxed">
                Your JSON is parsed, formatted, searched and repaired entirely in your browser. Nothing is uploaded to a server
                unless you explicitly use "Open from URL", which fetches directly from your browser to that address. Recent
                documents are stored only in this browser's local storage.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
