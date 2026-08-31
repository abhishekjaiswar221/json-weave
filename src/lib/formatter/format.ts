import type { JsonValue } from '../parser/types';

export type IndentStyle = 2 | 4 | 'tab';

function indentString(style: IndentStyle): string {
  return style === 'tab' ? '\t' : ' '.repeat(style);
}

export function sortKeysDeep(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, JsonValue> = {};
    for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
      sorted[key] = sortKeysDeep((value as Record<string, JsonValue>)[key]);
    }
    return sorted;
  }
  return value;
}

export function formatJson(value: JsonValue, opts: { indent?: IndentStyle; sortKeys?: boolean; trailingNewline?: boolean } = {}): string {
  const { indent = 2, sortKeys = false, trailingNewline = true } = opts;
  const v = sortKeys ? sortKeysDeep(value) : value;
  const out = JSON.stringify(v, null, indentString(indent));
  return trailingNewline ? out + '\n' : out;
}

export function minifyJson(value: JsonValue, opts: { sortKeys?: boolean } = {}): string {
  const v = opts.sortKeys ? sortKeysDeep(value) : value;
  return JSON.stringify(v);
}

export function byteSize(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function countLines(text: string): number {
  if (text.length === 0) return 0;
  return text.split('\n').length;
}

export interface StructureStats {
  objects: number;
  arrays: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  maxDepth: number;
}

export function computeStats(value: JsonValue | undefined, depth = 0): StructureStats {
  const stats: StructureStats = { objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0, maxDepth: depth };
  const walk = (v: JsonValue | undefined, d: number) => {
    stats.maxDepth = Math.max(stats.maxDepth, d);
    if (v === null || v === undefined) {
      stats.nulls++;
    } else if (Array.isArray(v)) {
      stats.arrays++;
      for (const item of v) walk(item, d + 1);
    } else if (typeof v === 'object') {
      stats.objects++;
      for (const key of Object.keys(v)) walk((v as Record<string, JsonValue>)[key], d + 1);
    } else if (typeof v === 'string') {
      stats.strings++;
    } else if (typeof v === 'number') {
      stats.numbers++;
    } else if (typeof v === 'boolean') {
      stats.booleans++;
    }
  };
  walk(value, depth);
  return stats;
}
