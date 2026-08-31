// Heuristic detection of "smart" string values, all evaluated purely locally.

export type PreviewKind = 'url' | 'email' | 'date' | 'color' | 'jwt' | 'none';

const URL_RE = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const JWT_RE = /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;

export function detectPreviewKind(value: string): PreviewKind {
  if (typeof value !== 'string' || value.length === 0 || value.length > 4000) return 'none';
  if (JWT_RE.test(value)) return 'jwt';
  if (HEX_COLOR_RE.test(value)) return 'color';
  if (EMAIL_RE.test(value)) return 'email';
  if (URL_RE.test(value)) return 'url';
  if (ISO_DATE_RE.test(value) && !Number.isNaN(Date.parse(value))) return 'date';
  return 'none';
}

export function formatDatePreview(value: string): string | null {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: value.includes('T') ? 'short' : undefined });
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=');
  try {
    const binary = atob(padded);
    // decode as UTF-8
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return atob(padded);
  }
}

export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signaturePresent: boolean;
}

/** Decodes a JWT entirely client-side — the token never leaves the browser. */
export function decodeJwt(token: string): DecodedJwt | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return { header, payload, signaturePresent: Boolean(parts[2]) };
  } catch {
    return null;
  }
}
