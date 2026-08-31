import type { Position } from './types';

export type TokenType =
  | 'brace-open'
  | 'brace-close'
  | 'bracket-open'
  | 'bracket-close'
  | 'colon'
  | 'comma'
  | 'string'
  | 'number'
  | 'identifier' // true/false/null/unquoted keys/garbage words
  | 'comment'
  | 'eof';

export interface Token {
  type: TokenType;
  value: string;
  /** parsed string value when type === 'string' */
  stringValue?: string;
  quote?: '"' | "'" | 'none';
  unterminated?: boolean;
  start: Position;
  end: Position;
}

const isDigit = (c: string) => c >= '0' && c <= '9';
const isIdentStart = (c: string) => /[A-Za-z_$]/.test(c);
const isIdentPart = (c: string) => /[A-Za-z0-9_$]/.test(c);

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let col = 1;
  const len = source.length;

  const pos = (offset: number, l: number, c: number): Position => ({ line: l, column: c, offset });

  function advance(n = 1) {
    for (let k = 0; k < n; k++) {
      if (source[i] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
      i++;
    }
  }

  while (i < len) {
    const ch = source[i];

    // whitespace
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      advance();
      continue;
    }

    const startPos = pos(i, line, col);

    // comments (tolerated, not standard JSON)
    if (ch === '/' && source[i + 1] === '/') {
      const start = i;
      while (i < len && source[i] !== '\n') advance();
      tokens.push({ type: 'comment', value: source.slice(start, i), start: startPos, end: pos(i, line, col) });
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      const start = i;
      advance(2);
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) advance();
      if (i < len) advance(2);
      tokens.push({ type: 'comment', value: source.slice(start, i), start: startPos, end: pos(i, line, col) });
      continue;
    }

    if (ch === '{') {
      advance();
      tokens.push({ type: 'brace-open', value: '{', start: startPos, end: pos(i, line, col) });
      continue;
    }
    if (ch === '}') {
      advance();
      tokens.push({ type: 'brace-close', value: '}', start: startPos, end: pos(i, line, col) });
      continue;
    }
    if (ch === '[') {
      advance();
      tokens.push({ type: 'bracket-open', value: '[', start: startPos, end: pos(i, line, col) });
      continue;
    }
    if (ch === ']') {
      advance();
      tokens.push({ type: 'bracket-close', value: ']', start: startPos, end: pos(i, line, col) });
      continue;
    }
    if (ch === ':') {
      advance();
      tokens.push({ type: 'colon', value: ':', start: startPos, end: pos(i, line, col) });
      continue;
    }
    if (ch === ',') {
      advance();
      tokens.push({ type: 'comma', value: ',', start: startPos, end: pos(i, line, col) });
      continue;
    }

    // strings: double or single quoted
    if (ch === '"' || ch === "'") {
      const quoteChar = ch;
      const start = i;
      advance();
      let value = '';
      let unterminated = false;
      while (true) {
        if (i >= len) {
          unterminated = true;
          break;
        }
        const c = source[i];
        if (c === '\n') {
          unterminated = true;
          break;
        }
        if (c === quoteChar) {
          advance();
          break;
        }
        if (c === '\\' && i + 1 < len) {
          const next = source[i + 1];
          const escapes: Record<string, string> = {
            '"': '"', "'": "'", '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t',
          };
          if (next === 'u' && i + 5 < len) {
            const hex = source.slice(i + 2, i + 6);
            value += String.fromCharCode(parseInt(hex, 16) || 0);
            advance(6);
            continue;
          }
          if (next in escapes) {
            value += escapes[next];
            advance(2);
            continue;
          }
          value += next;
          advance(2);
          continue;
        }
        value += c;
        advance();
      }
      tokens.push({
        type: 'string',
        value: source.slice(start, i),
        stringValue: value,
        quote: quoteChar as '"' | "'",
        unterminated,
        start: startPos,
        end: pos(i, line, col),
      });
      continue;
    }

    // numbers
    if (ch === '-' || isDigit(ch)) {
      const start = i;
      if (ch === '-') advance();
      while (i < len && isDigit(source[i])) advance();
      if (source[i] === '.') {
        advance();
        while (i < len && isDigit(source[i])) advance();
      }
      if (source[i] === 'e' || source[i] === 'E') {
        advance();
        if (source[i] === '+' || source[i] === '-') advance();
        while (i < len && isDigit(source[i])) advance();
      }
      tokens.push({ type: 'number', value: source.slice(start, i), start: startPos, end: pos(i, line, col) });
      continue;
    }

    // identifiers: true / false / null / unquoted keys / stray words
    if (isIdentStart(ch)) {
      const start = i;
      while (i < len && isIdentPart(source[i])) advance();
      tokens.push({ type: 'identifier', value: source.slice(start, i), start: startPos, end: pos(i, line, col) });
      continue;
    }

    // unknown character — emit as a single-char identifier so the parser can
    // report it and skip past it rather than looping forever.
    advance();
    tokens.push({ type: 'identifier', value: ch, start: startPos, end: pos(i, line, col) });
  }

  tokens.push({ type: 'eof', value: '', start: pos(i, line, col), end: pos(i, line, col) });
  return tokens;
}
