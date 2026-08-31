import yaml from 'js-yaml';
import type { JsonValue } from '../parser/types';

export function jsonToYaml(value: JsonValue): string {
  return yaml.dump(value, { indent: 2, lineWidth: 100, noRefs: true });
}

function isArrayOfFlatObjects(value: JsonValue): value is Record<string, JsonValue>[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item));
}

export function canRenderAsTable(value: JsonValue | undefined): value is Record<string, JsonValue>[] {
  return value !== undefined && isArrayOfFlatObjects(value);
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function jsonToCsv(value: JsonValue): string {
  if (!isArrayOfFlatObjects(value)) {
    throw new Error('CSV export requires an array of objects.');
  }
  const columns: string[] = [];
  for (const row of value) {
    for (const key of Object.keys(row)) {
      if (!columns.includes(key)) columns.push(key);
    }
  }
  const lines = [columns.map(csvEscape).join(',')];
  for (const row of value) {
    lines.push(columns.map((c) => csvEscape(row[c])).join(','));
  }
  return lines.join('\n');
}
