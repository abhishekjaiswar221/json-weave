import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  FolderOpen, ClipboardPaste, FileCode, ArrowRight, WandSparkles, Wrench, ListTree,
  SearchCode, Eye, GitCompare, ShieldCheck, Command,
} from 'lucide-react';
import { Logo, LogoMark } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useUiStore } from '../store/uiStore';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { EXAMPLES } from '../lib/examples';
import { OpenUrlModal } from '../components/import/OpenUrlModal';
import { ToastContainer } from '../components/common/ToastContainer';

const FEATURES = [
  { icon: WandSparkles, title: 'Smart formatting', desc: 'Beautify, minify or sort keys with configurable indentation — instant, in-browser.' },
  { icon: Wrench, title: 'Partial JSON repair', desc: 'Trailing commas, unquoted keys, dangling strings — explained plainly, fixed on review.' },
  { icon: ListTree, title: 'Tree explorer', desc: 'Collapsible, virtualized tree that stays fast even on large documents.' },
  { icon: SearchCode, title: 'Deep search', desc: 'Search keys, values and paths at once — with instant highlight and jump.' },
  { icon: Eye, title: 'Inspector', desc: 'Select any value to see its type, path, length and smart previews.' },
  { icon: GitCompare, title: 'Compare', desc: 'Semantic diff between two documents — additions, removals, changes.' },
];

const WORKFLOW = ['Paste', 'Understand', 'Fix', 'Inspect', 'Export'];

export default function Landing() {
  const navigate = useNavigate();
  const loadDocument = useWorkspaceStore((s) => s.loadDocument);
  const openModal = useUiStore((s) => s.openModal);
  const pushToast = useUiStore((s) => s.pushToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const open = (name: string, content: string) => {
    loadDocument(name, content);
    navigate('/workspace');
  };

  const { isDragging, handlers } = useDragAndDrop((file) => {
    file.text().then((text) => open(file.name, text));
  });

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain');
      if (text && text.trim().length > 0) open('pasted.json', text);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) file.text().then((text) => open(file.name, text));
  };

  return (
    <div {...handlers} className="min-h-screen bg-canvas relative">
      <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={onFileChange} />

      {isDragging && (
        <div className="fixed inset-0 z-50 bg-canvas/90 backdrop-blur-sm flex items-center justify-center">
          <div className="border-2 border-dashed border-accent rounded-xl px-16 py-14 drop-active">
            <p className="text-[15px] text-accent font-medium">Drop your JSON file to open it</p>
          </div>
        </div>
      )}

      {/* nav */}
      <header className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo size={24} />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openModal('openUrl')}>Open from URL</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/workspace')}>
            Open Workspace <ArrowRight size={12} />
          </Button>
        </div>
      </header>

      {/* hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-14 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-[11.5px] text-text-muted mb-6">
          <ShieldCheck size={12} className="text-success" /> Processed entirely in your browser
        </div>
        <h1 className="text-[40px] leading-[1.1] font-semibold tracking-tight text-text">
          Understand your JSON.<br />Instantly.
        </h1>
        <p className="mt-4 text-[15px] text-text-muted max-w-lg mx-auto leading-relaxed">
          Open, format, inspect, search and repair JSON without fighting a wall of text.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2.5 flex-wrap">
          <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
            <FolderOpen size={14} /> Open JSON
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (text) open('pasted.json', text);
                else pushToast('error', 'Clipboard is empty');
              } catch {
                pushToast('info', 'Press Ctrl/Cmd+V anywhere on this page');
              }
            }}
          >
            <ClipboardPaste size={14} /> Paste JSON
          </Button>
          <Button variant="ghost" onClick={() => open(EXAMPLES[0].name, EXAMPLES[0].content)}>
            <FileCode size={14} /> Try an example
          </Button>
        </div>
        <p className="mt-4 text-[11.5px] text-text-faint">or drag &amp; drop a .json file anywhere on this page</p>
      </section>

      {/* preview strip */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xl">
          <div className="h-9 border-b border-border flex items-center gap-1.5 px-3.5">
            <span className="w-2.5 h-2.5 rounded-full bg-danger/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
            <span className="ml-2 mono text-[11px] text-text-faint">user-profile.json</span>
          </div>
          <div className="editor-dracula p-5 mono text-[12.5px] leading-relaxed overflow-hidden">
            <div><span style={{ color: 'var(--dracula-fg)' }}>{'{'}</span></div>
            <div className="pl-4"><span style={{ color: 'var(--dracula-green)' }}>"user"</span><span style={{ color: 'var(--dracula-comment)' }}>: </span><span style={{ color: 'var(--dracula-fg)' }}>{'{'}</span></div>
            <div className="pl-8"><span style={{ color: 'var(--dracula-green)' }}>"name"</span><span style={{ color: 'var(--dracula-comment)' }}>: </span><span style={{ color: 'var(--dracula-cyan)' }}>"Ada Lovelace"</span><span style={{ color: 'var(--dracula-comment)' }}>,</span></div>
            <div className="pl-8"><span style={{ color: 'var(--dracula-green)' }}>"verified"</span><span style={{ color: 'var(--dracula-comment)' }}>: </span><span style={{ color: 'var(--dracula-orange)' }}>true</span><span style={{ color: 'var(--dracula-comment)' }}>,</span></div>
            <div className="pl-8"><span style={{ color: 'var(--dracula-green)' }}>"role"</span><span style={{ color: 'var(--dracula-comment)' }}>: </span><span style={{ color: 'var(--dracula-pink)' }}>null</span></div>
            <div className="pl-4"><span style={{ color: 'var(--dracula-fg)' }}>{'}'}</span><span style={{ color: 'var(--dracula-comment)' }}>,</span></div>
            <div className="pl-4"><span style={{ color: 'var(--dracula-green)' }}>"posts"</span><span style={{ color: 'var(--dracula-comment)' }}>: [</span><span style={{ color: 'var(--dracula-purple)' }}>1</span><span style={{ color: 'var(--dracula-comment)' }}>, </span><span style={{ color: 'var(--dracula-purple)' }}>2</span><span style={{ color: 'var(--dracula-comment)' }}>, </span><span style={{ color: 'var(--dracula-purple)' }}>3</span><span style={{ color: 'var(--dracula-comment)' }}>]</span></div>
            <div><span style={{ color: 'var(--dracula-fg)' }}>{'}'}</span></div>
          </div>
        </div>
      </section>

      {/* why */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-[22px] font-semibold text-text">Why this exists</h2>
        <p className="mt-3 text-[13.5px] text-text-muted leading-relaxed">
          API responses, config exports and database dumps rarely arrive clean. Most viewers give up the moment a comma is
          out of place. ParseNest keeps working — it explains exactly what's wrong, shows you where, and lets you fix it
          without losing your place.
        </p>
      </section>

      {/* features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-surface p-5">
              <f.icon size={16} className="text-accent mb-3" />
              <h3 className="text-[13px] font-medium text-text">{f.title}</h3>
              <p className="mt-1.5 text-[12px] text-text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* workflow */}
      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-[13px] font-medium text-text-faint uppercase tracking-widest mb-6">Developer workflow</h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {WORKFLOW.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-md border border-border bg-surface-2 px-3.5 py-1.5 text-[12.5px] text-text">{step}</span>
              {i < WORKFLOW.length - 1 && <ArrowRight size={13} className="text-text-faint" />}
            </div>
          ))}
        </div>
      </section>

      {/* privacy */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="rounded-xl border border-border bg-surface-2 px-8 py-10">
          <ShieldCheck size={22} className="text-success mx-auto mb-4" />
          <h2 className="text-[19px] font-semibold text-text">Your JSON should not become somebody else's database.</h2>
          <p className="mt-3 text-[13px] text-text-muted leading-relaxed max-w-lg mx-auto">
            Local processing is the default, not an option. Parsing, formatting, searching and repair all happen in your
            browser. Nothing is uploaded unless you explicitly load a URL — and even then, your browser talks directly to
            that address.
          </p>
        </div>
      </section>

      {/* command palette hint */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-[12.5px] text-text-muted">
          <Command size={14} className="text-text-faint" />
          Keyboard-first: press <kbd className="mono text-[11px] px-1.5 py-0.5 rounded border border-border-strong bg-surface-3">⌘K</kbd> anywhere in the workspace to open the command palette.
        </div>
      </section>

      {/* final CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-[22px] font-semibold text-text">Ready to crack open some JSON?</h2>
        <div className="mt-6">
          <Button variant="primary" size="md" onClick={() => fileInputRef.current?.click()} className={clsx('px-5')}>
            Open JSON <ArrowRight size={13} />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-faint">
            <LogoMark size={16} />
            <span className="text-[12px]">ParseNest</span>
          </div>
          <span className="text-[11.5px] text-text-faint">Local-first JSON workspace</span>
        </div>
      </footer>

      <OpenUrlModal />
      <ToastContainer />
    </div>
  );
}
