import { tokenize, type Token } from './tokenizer';
import type {
  AstNode, ArrayNode, ObjectNode, ObjectProperty, Diagnostic, JsonValue, ParseResult, Position,
} from './types';

const truncate = (s: string, n = 40) => (s.length > n ? s.slice(0, n) + '…' : s);

class Parser {
  tokens: Token[];
  pos = 0;
  diagnostics: Diagnostic[] = [];
  tolerated = false;

  constructor(tokens: Token[]) {
    // comments are tolerated but don't participate in structural parsing
    this.tokens = tokens.filter((t) => {
      if (t.type === 'comment') {
        this.diagnostics.push({
          code: 'comment-tolerated',
          severity: 'info',
          message: 'Comment tolerated (not valid in strict JSON).',
          detail: 'Standard JSON has no comment syntax. This was kept during parsing but will be dropped if you format or repair.',
          start: t.start,
          end: t.end,
        });
        this.tolerated = true;
        return false;
      }
      return true;
    });
  }

  peek(offset = 0): Token {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)];
  }

  next(): Token {
    const t = this.tokens[this.pos];
    if (this.pos < this.tokens.length - 1) this.pos++;
    return t;
  }

  add(d: Diagnostic) {
    this.diagnostics.push(d);
    this.tolerated = true;
  }

  parseDocument(): AstNode | undefined {
    const first = this.peek();
    if (first.type === 'eof') {
      this.add({
        code: 'empty-document',
        severity: 'info',
        message: 'Document is empty.',
        start: first.start,
        end: first.end,
      });
      return undefined;
    }
    const value = this.parseValue();
    const trailing = this.peek();
    if (trailing.type !== 'eof') {
      this.add({
        code: 'trailing-content',
        severity: 'warning',
        message: `Unexpected content after the JSON value ended (starting with "${truncate(trailing.value)}").`,
        detail: 'Everything after the first complete JSON value is ignored by strict parsers.',
        start: trailing.start,
        end: this.tokens[this.tokens.length - 1].start,
      });
    }
    return value;
  }

  /** Parses a value at the current position; never returns undefined — falls back to `missing`. */
  parseValue(): AstNode {
    const t = this.peek();
    switch (t.type) {
      case 'brace-open':
        return this.parseObject();
      case 'bracket-open':
        return this.parseArray();
      case 'string':
        return this.parseString();
      case 'number':
        return this.parseNumber();
      case 'identifier':
        return this.parseIdentifierValue();
      default: {
        this.add({
          code: 'missing-value',
          severity: 'error',
          message: `Expected a value but found "${truncate(t.value || t.type)}".`,
          start: t.start,
          end: t.end,
        });
        return { type: 'missing', start: t.start, end: t.start, raw: '' };
      }
    }
  }

  parseIdentifierValue(): AstNode {
    const t = this.next();
    const word = t.value;
    if (word === 'true' || word === 'false') {
      return { type: 'boolean', value: word === 'true', start: t.start, end: t.end, raw: word };
    }
    if (word === 'null') {
      return { type: 'null', start: t.start, end: t.end, raw: word };
    }
    if (word === 'undefined' || word === 'NaN') {
      this.add({
        code: 'unexpected-token',
        severity: 'warning',
        message: `"${word}" is not valid JSON; treating it as null.`,
        start: t.start,
        end: t.end,
      });
      return { type: 'null', start: t.start, end: t.end, raw: word };
    }
    this.add({
      code: 'unexpected-token',
      severity: 'error',
      message: `Unexpected token "${truncate(word)}". Values must be a string, number, object, array, true, false, or null.`,
      start: t.start,
      end: t.end,
    });
    return { type: 'missing', start: t.start, end: t.end, raw: word };
  }

  parseString(): AstNode {
    const t = this.next();
    if (t.unterminated) {
      this.add({
        code: 'unterminated-string',
        severity: 'error',
        message: 'String appears to be missing a closing quote.',
        detail: 'A string that starts here runs to the end of the line (or file) without a matching quote.',
        start: t.start,
        end: t.end,
        suggestedFix: `${t.value}${t.quote === "'" ? "'" : '"'}`,
      });
    } else if (t.quote === "'") {
      this.add({
        code: 'single-quoted-string',
        severity: 'warning',
        message: 'String uses single quotes; JSON strings must use double quotes.',
        start: t.start,
        end: t.end,
        suggestedFix: `"${(t.stringValue ?? '').replace(/"/g, '\\"')}"`,
      });
    }
    return { type: 'string', value: t.stringValue ?? '', start: t.start, end: t.end, raw: t.value, unterminated: t.unterminated, quote: t.quote };
  }

  parseNumber(): AstNode {
    const t = this.next();
    const n = Number(t.value);
    if (Number.isNaN(n)) {
      this.add({
        code: 'invalid-number',
        severity: 'error',
        message: `"${t.value}" is not a valid number.`,
        start: t.start,
        end: t.end,
      });
      return { type: 'missing', start: t.start, end: t.end, raw: t.value };
    }
    return { type: 'number', value: n, start: t.start, end: t.end, raw: t.value };
  }

  /** Reads a property key: a proper string, or a bare identifier (unquoted key). */
  parseKey(): { key: string; node: AstNode; unquoted: boolean } | undefined {
    const t = this.peek();
    if (t.type === 'string') {
      const node = this.parseString();
      return { key: (node as { value: string }).value, node, unquoted: false };
    }
    if (t.type === 'identifier') {
      this.next();
      this.add({
        code: 'unquoted-key',
        severity: 'warning',
        message: `Key \`${t.value}\` is not quoted.`,
        detail: 'JSON object keys must be double-quoted strings.',
        start: t.start,
        end: t.end,
        suggestedFix: `"${t.value}"`,
      });
      return {
        key: t.value,
        node: { type: 'string', value: t.value, start: t.start, end: t.end, raw: t.value, quote: 'none' },
        unquoted: true,
      };
    }
    if (t.type === 'number') {
      // e.g. { 42: "x" } — tolerate numeric keys
      this.next();
      this.add({
        code: 'unquoted-key',
        severity: 'warning',
        message: `Key \`${t.value}\` is not quoted.`,
        start: t.start,
        end: t.end,
        suggestedFix: `"${t.value}"`,
      });
      return {
        key: t.value,
        node: { type: 'string', value: t.value, start: t.start, end: t.end, raw: t.value, quote: 'none' },
        unquoted: true,
      };
    }
    return undefined;
  }

  parseObject(): ObjectNode {
    const open = this.next(); // consume {
    const properties: ObjectProperty[] = [];
    const seenKeys = new Map<string, Position>();

    while (true) {
      const t = this.peek();
      if (t.type === 'eof') {
        this.add({
          code: 'unclosed-object',
          severity: 'error',
          message: 'Missing closing `}` for this object.',
          start: open.start,
          end: open.end,
          suggestedFix: '}',
        });
        break;
      }
      if (t.type === 'brace-close') {
        this.next();
        break;
      }
      if (t.type === 'comma') {
        // stray/leading comma — skip it and keep going
        this.next();
        continue;
      }

      const keyResult = this.parseKey();
      if (!keyResult) {
        this.add({
          code: 'unexpected-token',
          severity: 'error',
          message: `Expected a property key but found "${truncate(t.value || t.type)}".`,
          start: t.start,
          end: t.end,
        });
        this.next(); // skip and try to recover
        continue;
      }

      if (seenKeys.has(keyResult.key)) {
        this.add({
          code: 'duplicate-key',
          severity: 'warning',
          message: `Key \`${keyResult.key}\` appears more than once; the last value wins.`,
          start: keyResult.node.start,
          end: keyResult.node.end,
        });
      }
      seenKeys.set(keyResult.key, keyResult.node.start);

      const colon = this.peek();
      if (colon.type === 'colon') {
        this.next();
      } else {
        this.add({
          code: 'missing-colon',
          severity: 'error',
          message: `Missing \`:\` after key \`${keyResult.key}\`.`,
          start: keyResult.node.end,
          end: keyResult.node.end,
          suggestedFix: ':',
        });
      }

      const valueNode = this.parseValue();
      properties.push({ key: keyResult.key, keyNode: keyResult.node, valueNode, keyUnquoted: keyResult.unquoted });

      const after = this.peek();
      if (after.type === 'comma') {
        const commaTok = this.next();
        const closing = this.peek();
        if (closing.type === 'brace-close') {
          const propSummary = truncate(`"${keyResult.key}": ${summarizeValue(valueNode)}`);
          this.add({
            code: 'trailing-comma',
            severity: 'warning',
            message: `Possible trailing comma after \`${propSummary}\`.`,
            detail: 'Standard JSON does not allow a comma before a closing `}`.',
            start: commaTok.start,
            end: commaTok.end,
            suggestedFix: '',
          });
        }
        continue;
      }
      if (after.type === 'brace-close') {
        continue; // loop head will consume it
      }
      if (after.type === 'eof') {
        continue; // loop head will report unclosed-object
      }
      // Missing comma between properties — recover by continuing to parse.
      this.add({
        code: 'missing-comma',
        severity: 'error',
        message: `Missing comma after \`"${keyResult.key}"\`.`,
        start: valueNode.end,
        end: valueNode.end,
        suggestedFix: ',',
      });
    }

    const end = this.tokens[this.pos - 1]?.end ?? open.end;
    return { type: 'object', properties, start: open.start, end, raw: '' };
  }

  parseArray(): ArrayNode {
    const open = this.next(); // consume [
    const items: AstNode[] = [];

    while (true) {
      const t = this.peek();
      if (t.type === 'eof') {
        this.add({
          code: 'unclosed-array',
          severity: 'error',
          message: 'Missing closing `]` for this array.',
          start: open.start,
          end: open.end,
          suggestedFix: ']',
        });
        break;
      }
      if (t.type === 'bracket-close') {
        this.next();
        break;
      }
      if (t.type === 'comma') {
        this.next();
        continue;
      }

      const itemNode = this.parseValue();
      items.push(itemNode);

      const after = this.peek();
      if (after.type === 'comma') {
        const commaTok = this.next();
        const closing = this.peek();
        if (closing.type === 'bracket-close') {
          this.add({
            code: 'trailing-comma',
            severity: 'warning',
            message: `Possible trailing comma after \`${truncate(summarizeValue(itemNode))}\`.`,
            detail: 'Standard JSON does not allow a comma before a closing `]`.',
            start: commaTok.start,
            end: commaTok.end,
            suggestedFix: '',
          });
        }
        continue;
      }
      if (after.type === 'bracket-close' || after.type === 'eof') {
        continue;
      }
      this.add({
        code: 'missing-comma',
        severity: 'error',
        message: 'Missing comma between array items.',
        start: itemNode.end,
        end: itemNode.end,
        suggestedFix: ',',
      });
    }

    const end = this.tokens[this.pos - 1]?.end ?? open.end;
    return { type: 'array', items, start: open.start, end, raw: '' };
  }
}

function summarizeValue(node: AstNode): string {
  switch (node.type) {
    case 'string':
      return `"${node.value}"`;
    case 'number':
      return String(node.value);
    case 'boolean':
      return String(node.value);
    case 'null':
      return 'null';
    case 'object':
      return '{ … }';
    case 'array':
      return '[ … ]';
    default:
      return '…';
  }
}

export function astToValue(node: AstNode | undefined): JsonValue | undefined {
  if (!node) return undefined;
  switch (node.type) {
    case 'object': {
      const obj: Record<string, JsonValue> = {};
      for (const p of node.properties) {
        const v = astToValue(p.valueNode);
        obj[p.key] = v === undefined ? null : v;
      }
      return obj;
    }
    case 'array':
      return node.items.map((i) => {
        const v = astToValue(i);
        return v === undefined ? null : v;
      });
    case 'string':
      return node.value;
    case 'number':
      return node.value;
    case 'boolean':
      return node.value;
    case 'null':
      return null;
    case 'missing':
      return null;
  }
}

import type { JsonPath } from '../json-path/path';

/** Finds the JSON path of the deepest node whose source range contains `offset`. */
export function findPathAtOffset(ast: AstNode | undefined, offset: number): JsonPath | null {
  if (!ast) return null;
  if (offset < ast.start.offset || offset > ast.end.offset) return null;

  const walk = (node: AstNode, path: JsonPath): JsonPath => {
    if (node.type === 'object') {
      for (const prop of node.properties) {
        if (offset >= prop.valueNode.start.offset && offset <= prop.valueNode.end.offset) {
          return walk(prop.valueNode, [...path, { type: 'key', value: prop.key }]);
        }
      }
      return path;
    }
    if (node.type === 'array') {
      for (let i = 0; i < node.items.length; i++) {
        const item = node.items[i];
        if (offset >= item.start.offset && offset <= item.end.offset) {
          return walk(item, [...path, { type: 'index', value: i }]);
        }
      }
      return path;
    }
    return path;
  };

  return walk(ast, []);
}

export function parseTolerant(source: string): ParseResult {
  const tokens = tokenize(source);
  const parser = new Parser(tokens);
  const ast = parser.parseDocument();
  const value = astToValue(ast);
  return {
    ast,
    value,
    diagnostics: parser.diagnostics.sort((a, b) => a.start.offset - b.start.offset),
    strictlyValid: !parser.tolerated && ast !== undefined,
  };
}
