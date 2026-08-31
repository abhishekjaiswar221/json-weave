import type { JsonValue } from '../parser/types';
import { appendIndex, appendKey, formatPath, type JsonPath } from '../json-path/path';

export type SearchTarget = 'keys' | 'values' | 'paths';

export interface SearchMatch {
  path: JsonPath;
  pathString: string;
  matchedIn: SearchTarget;
  key?: string;
  preview: string;
}

export interface SearchOptions {
  query: string;
  targets: SearchTarget[];
  caseSensitive?: boolean;
}

function valuePreview(v: JsonValue): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (typeof v === 'object') return `Object(${Object.keys(v).length})`;
  if (typeof v === 'string') return `"${v}"`;
  return String(v);
}

export function searchJson(value: JsonValue | undefined, opts: SearchOptions): SearchMatch[] {
  const { query, targets } = opts;
  if (!query || value === undefined) return [];
  const needle = opts.caseSensitive ? query : query.toLowerCase();
  const norm = (s: string) => (opts.caseSensitive ? s : s.toLowerCase());
  const matches: SearchMatch[] = [];

  const visit = (v: JsonValue, path: JsonPath, key?: string) => {
    if (targets.includes('keys') && key !== undefined && norm(key).includes(needle)) {
      matches.push({ path, pathString: formatPath(path), matchedIn: 'keys', key, preview: valuePreview(v) });
    }
    if (targets.includes('paths')) {
      const ps = formatPath(path);
      if (norm(ps).includes(needle)) {
        matches.push({ path, pathString: ps, matchedIn: 'paths', key, preview: valuePreview(v) });
      }
    }
    if (targets.includes('values')) {
      if (typeof v === 'string' && norm(v).includes(needle)) {
        matches.push({ path, pathString: formatPath(path), matchedIn: 'values', key, preview: valuePreview(v) });
      } else if ((typeof v === 'number' || typeof v === 'boolean') && norm(String(v)).includes(needle)) {
        matches.push({ path, pathString: formatPath(path), matchedIn: 'values', key, preview: valuePreview(v) });
      }
    }

    if (Array.isArray(v)) {
      v.forEach((item, i) => visit(item, appendIndex(path, i)));
    } else if (v !== null && typeof v === 'object') {
      for (const k of Object.keys(v)) {
        visit((v as Record<string, JsonValue>)[k], appendKey(path, k), k);
      }
    }
  };

  visit(value, []);
  return matches;
}
