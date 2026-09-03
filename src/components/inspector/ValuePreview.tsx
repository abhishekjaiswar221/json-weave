import { ExternalLink, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { detectPreviewKind, decodeJwt, formatDatePreview } from '../../lib/valuePreview';

export function SmartValuePreview({ value }: { value: string }) {
  const kind = detectPreviewKind(value);
  const [jwtOpen, setJwtOpen] = useState(false);

  if (kind === 'url') {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1 text-[12px] text-accent-text hover:text-accent-hover"
      >
        Open link <ExternalLink size={11} />
      </a>
    );
  }

  if (kind === 'email') {
    return (
      <a href={`mailto:${value}`} className="mt-1 inline-flex items-center gap-1 text-[12px] text-accent-text hover:text-accent-hover">
        Email address
      </a>
    );
  }

  if (kind === 'date') {
    const formatted = formatDatePreview(value);
    if (!formatted) return null;
    return <div className="mt-1 text-[12px] text-text-muted">{formatted}</div>;
  }

  if (kind === 'color') {
    return (
      <div className="mt-1 flex items-center gap-2">
        <span className="w-4 h-4 rounded border border-border-strong" style={{ background: value }} />
        <span className="text-[12px] text-text-muted">Color</span>
      </div>
    );
  }

  if (kind === 'jwt') {
    const decoded = jwtOpen ? decodeJwt(value) : null;
    return (
      <div className="mt-1">
        <button
          onClick={() => setJwtOpen((o) => !o)}
          className="inline-flex items-center gap-1 text-[12px] text-accent-text hover:text-accent-hover"
        >
          <KeyRound size={11} /> {jwtOpen ? 'Hide decoded JWT' : 'Decode JWT'}
        </button>
        <p className="mt-1 text-[10.5px] text-text-faint">Decoded locally in your browser — never sent anywhere.</p>
        {jwtOpen && decoded && (
          <div className="mt-2 space-y-2">
            <div>
              <div className="text-[10.5px] uppercase tracking-wide text-text-faint mb-1">Header</div>
              <pre className="mono text-[11px] text-text bg-surface-3 rounded-md p-2 overflow-auto max-h-32">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-wide text-text-faint mb-1">Payload</div>
              <pre className="mono text-[11px] text-text bg-surface-3 rounded-md p-2 overflow-auto max-h-40">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>
          </div>
        )}
        {jwtOpen && !decoded && <p className="mt-1 text-[11.5px] text-danger">Could not decode this token.</p>}
      </div>
    );
  }

  return null;
}
