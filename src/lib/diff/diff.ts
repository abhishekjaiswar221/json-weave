import type { JsonValue } from '../parser/types';
import { formatPath, appendIndex, appendKey, type JsonPath } from '../json-path/path';

export type DiffKind = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  path: JsonPath;
  pathString: string;
  kind: DiffKind;
  before?: JsonValue;
  after?: JsonValue;
}

function isObj(v: JsonValue | undefined): v is Record<string, JsonValue> {
  return v !== null && v !== undefined && typeof v === 'object' && !Array.isArray(v);
}

function deepEqual(a: JsonValue | undefined, b: JsonValue | undefined): boolean {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (isObj(a) && isObj(b)) {
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    return ak.every((k) => k in b && deepEqual(a[k], b[k]));
  }
  return false;
}

/** Semantic recursive diff between two JSON values. Only leaf/branch-level entries with actual differences are emitted (plus their containing branches implicitly). */
export function diffJson(before: JsonValue | undefined, after: JsonValue | undefined): DiffEntry[] {
  const entries: DiffEntry[] = [];

  const walk = (b: JsonValue | undefined, a: JsonValue | undefined, path: JsonPath) => {
    if (deepEqual(b, a)) return;

    const bothObj = isObj(b) && isObj(a);
    const bothArr = Array.isArray(b) && Array.isArray(a);

    if (bothObj) {
      const bObj = b as Record<string, JsonValue>;
      const aObj = a as Record<string, JsonValue>;
      const keys = new Set([...Object.keys(bObj), ...Object.keys(aObj)]);
      for (const k of keys) {
        const inB = k in bObj;
        const inA = k in aObj;
        if (inB && !inA) {
          entries.push({ path: appendKey(path, k), pathString: formatPath(appendKey(path, k)), kind: 'removed', before: bObj[k] });
        } else if (!inB && inA) {
          entries.push({ path: appendKey(path, k), pathString: formatPath(appendKey(path, k)), kind: 'added', after: aObj[k] });
        } else {
          walk(bObj[k], aObj[k], appendKey(path, k));
        }
      }
      return;
    }

    if (bothArr) {
      const bArr = b as JsonValue[];
      const aArr = a as JsonValue[];
      const max = Math.max(bArr.length, aArr.length);
      for (let i = 0; i < max; i++) {
        if (i >= bArr.length) {
          entries.push({ path: appendIndex(path, i), pathString: formatPath(appendIndex(path, i)), kind: 'added', after: aArr[i] });
        } else if (i >= aArr.length) {
          entries.push({ path: appendIndex(path, i), pathString: formatPath(appendIndex(path, i)), kind: 'removed', before: bArr[i] });
        } else {
          walk(bArr[i], aArr[i], appendIndex(path, i));
        }
      }
      return;
    }

    // leaf-level or type change
    entries.push({ path, pathString: formatPath(path), kind: 'changed', before: b, after: a });
  };

  walk(before, after, []);
  return entries;
}

export interface DiffSummary {
  added: number;
  removed: number;
  changed: number;
}

export function summarizeDiff(entries: DiffEntry[]): DiffSummary {
  const s: DiffSummary = { added: 0, removed: 0, changed: 0 };
  for (const e of entries) {
    if (e.kind === 'added') s.added++;
    else if (e.kind === 'removed') s.removed++;
    else if (e.kind === 'changed') s.changed++;
  }
  return s;
}
