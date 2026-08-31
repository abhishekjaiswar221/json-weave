import { parseTolerant, astToValue } from '../parser/tolerantParser';
import { formatJson, type IndentStyle } from '../formatter/format';
import type { Diagnostic } from '../parser/types';

export interface RepairIssue {
  id: string;
  diagnostic: Diagnostic;
  label: string;
}

export interface RepairPreview {
  issues: RepairIssue[];
  original: string;
  repaired: string;
  /** true when there is nothing to repair (source already strictly valid) */
  clean: boolean;
}

const NOISY_CODES = new Set(['comment-tolerated', 'trailing-content', 'empty-document']);

export function buildRepairPreview(source: string, indent: IndentStyle = 2): RepairPreview {
  const result = parseTolerant(source);
  const issues: RepairIssue[] = result.diagnostics
    .filter((d) => !NOISY_CODES.has(d.code) || d.severity !== 'info')
    .map((d, i) => ({ id: `issue-${i}`, diagnostic: d, label: issueLabel(d) }));

  const repaired = result.value === undefined ? source : formatJson(result.value, { indent });

  return {
    issues,
    original: source,
    repaired,
    clean: result.strictlyValid || issues.length === 0,
  };
}

function issueLabel(d: Diagnostic): string {
  switch (d.code) {
    case 'trailing-comma':
      return 'Trailing comma';
    case 'unquoted-key':
      return 'Unquoted property name';
    case 'single-quoted-string':
      return 'Single-quoted string';
    case 'unterminated-string':
      return 'Unterminated string';
    case 'missing-comma':
      return 'Missing comma';
    case 'missing-colon':
      return 'Missing colon';
    case 'missing-value':
      return 'Missing value';
    case 'unclosed-object':
      return 'Missing closing brace';
    case 'unclosed-array':
      return 'Missing closing bracket';
    case 'unexpected-token':
      return 'Unexpected token';
    case 'duplicate-key':
      return 'Duplicate key';
    case 'invalid-number':
      return 'Invalid number';
    default:
      return d.message;
  }
}

export function astRoundTrip(source: string) {
  return astToValue(parseTolerant(source).ast);
}
