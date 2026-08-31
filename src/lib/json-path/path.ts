export type PathSegment = { type: 'key'; value: string } | { type: 'index'; value: number };

export type JsonPath = PathSegment[];

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** Formats a path as a JSONPath-like string, e.g. $.users[0].profile["odd key"] */
export function formatPath(path: JsonPath): string {
  let out = '$';
  for (const seg of path) {
    if (seg.type === 'index') {
      out += `[${seg.value}]`;
    } else if (IDENT_RE.test(seg.value)) {
      out += `.${seg.value}`;
    } else {
      out += `[${JSON.stringify(seg.value)}]`;
    }
  }
  return out;
}

export function pathKey(path: JsonPath): string {
  return path.map((s) => (s.type === 'index' ? `[${s.value}]` : `.${s.value}`)).join('');
}

export function parentPath(path: JsonPath): JsonPath {
  return path.slice(0, -1);
}

export function appendKey(path: JsonPath, key: string): JsonPath {
  return [...path, { type: 'key', value: key }];
}

export function appendIndex(path: JsonPath, index: number): JsonPath {
  return [...path, { type: 'index', value: index }];
}

// Imported lazily to avoid a cycle at module init; JsonValue is a pure type import.
import type { JsonValue } from '../parser/types';

export function resolvePath(root: JsonValue | undefined, path: JsonPath): JsonValue | undefined {
  let current = root;
  for (const seg of path) {
    if (current === undefined || current === null) return undefined;
    if (seg.type === 'index') {
      if (!Array.isArray(current)) return undefined;
      current = current[seg.value];
    } else {
      if (typeof current !== 'object' || Array.isArray(current)) return undefined;
      current = (current as Record<string, JsonValue>)[seg.value];
    }
  }
  return current;
}
