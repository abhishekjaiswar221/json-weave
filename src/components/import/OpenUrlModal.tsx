import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useUiStore } from '../../store/uiStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { AlertTriangle } from 'lucide-react';

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const TIMEOUT_MS = 15000;

export function OpenUrlModal() {
  const activeModal = useUiStore((s) => s.activeModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const pushToast = useUiStore((s) => s.pushToast);
  const loadDocument = useWorkspaceStore((s) => s.loadDocument);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (activeModal !== 'openUrl') return null;

  const load = async () => {
    setError(null);
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      setError('That doesn\'t look like a valid URL.');
      return;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      setError('Only http:// and https:// URLs are supported.');
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(parsed.toString(), { signal: controller.signal, credentials: 'omit', redirect: 'follow' });
      if (!res.ok) {
        setError(`Request failed: ${res.status} ${res.statusText}`);
        return;
      }
      const contentLength = res.headers.get('content-length');
      if (contentLength && Number(contentLength) > MAX_BYTES) {
        setError('That file is larger than 15 MB — too large to open here.');
        return;
      }
      const text = await res.text();
      if (new TextEncoder().encode(text).length > MAX_BYTES) {
        setError('That file is larger than 15 MB — too large to open here.');
        return;
      }
      const name = parsed.pathname.split('/').filter(Boolean).pop() || 'remote.json';
      loadDocument(name.endsWith('.json') ? name : `${name}.json`, text);
      pushToast('success', `Loaded ${name}`);
      closeModal();
      setUrl('');
    } catch (e) {
      if ((e as Error).name === 'AbortError') setError('The request timed out.');
      else setError('Could not fetch that URL — it may not allow cross-origin requests from a browser.');
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={closeModal} title="Open from URL" description="Fetched directly from your browser — nothing passes through a server.">
      <div className="space-y-3">
        <input
          autoFocus
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          placeholder="https://api.example.com/data.json"
          className="w-full h-9 px-3 rounded-md border border-border-strong bg-surface-3 text-[13px] text-text placeholder:text-text-faint outline-none focus:border-accent mono"
        />
        {error && (
          <div className="flex items-start gap-2 text-[12px] text-danger">
            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex items-start gap-2 rounded-md bg-surface-3 px-3 py-2">
          <AlertTriangle size={13} className="shrink-0 mt-0.5 text-text-faint" />
          <p className="text-[11.5px] text-text-faint">
            The request is made directly from your browser to this URL — the destination will see your IP address, as with any
            request. No credentials or cookies are sent.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" onClick={load} disabled={!url || loading}>
            {loading ? 'Loading…' : 'Load JSON'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
