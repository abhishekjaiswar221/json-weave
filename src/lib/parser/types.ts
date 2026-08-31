// Core types for the tolerant JSON parser.
// The parser never throws on malformed input — it always returns a best-effort
// AST plus a list of diagnostics describing what looked wrong and why.

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type NodeType =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'missing'; // a placeholder inserted where a value was expected but absent

export interface Position {
  /** 1-based line number */
  line: number;
  /** 1-based column number */
  column: number;
  /** 0-based character offset into the source */
  offset: number;
}

export interface AstNodeBase {
  type: NodeType;
  start: Position;
  end: Position;
  /** raw source text this node was parsed from */
  raw: string;
}

export interface ObjectProperty {
  key: string;
  keyNode: AstNode;
  valueNode: AstNode;
  /** true when the key in source was missing quotes */
  keyUnquoted?: boolean;
}

export interface ObjectNode extends AstNodeBase {
  type: 'object';
  properties: ObjectProperty[];
}

export interface ArrayNode extends AstNodeBase {
  type: 'array';
  items: AstNode[];
}

export interface StringNode extends AstNodeBase {
  type: 'string';
  value: string;
  unterminated?: boolean;
  quote?: '"' | "'" | 'none';
}

export interface NumberNode extends AstNodeBase {
  type: 'number';
  value: number;
}

export interface BooleanNode extends AstNodeBase {
  type: 'boolean';
  value: boolean;
}

export interface NullNode extends AstNodeBase {
  type: 'null';
}

export interface MissingNode extends AstNodeBase {
  type: 'missing';
}

export type AstNode =
  | ObjectNode
  | ArrayNode
  | StringNode
  | NumberNode
  | BooleanNode
  | NullNode
  | MissingNode;

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export type DiagnosticCode =
  | 'trailing-comma'
  | 'unquoted-key'
  | 'single-quoted-string'
  | 'unterminated-string'
  | 'missing-comma'
  | 'missing-colon'
  | 'missing-value'
  | 'unclosed-object'
  | 'unclosed-array'
  | 'unexpected-token'
  | 'comment-tolerated'
  | 'empty-document'
  | 'trailing-content'
  | 'invalid-number'
  | 'duplicate-key';

export interface Diagnostic {
  code: DiagnosticCode;
  severity: DiagnosticSeverity;
  message: string;
  /** short, developer-facing explanation of *why*, shown in expanded views */
  detail?: string;
  start: Position;
  end: Position;
  /** suggested literal text replacement for this span, if a safe autofix exists */
  suggestedFix?: string;
}

export interface ParseResult {
  /** best-effort AST root; undefined only for a fully empty document */
  ast: AstNode | undefined;
  /** best-effort resolved JS value, walking through `missing` as null */
  value: JsonValue | undefined;
  diagnostics: Diagnostic[];
  /** true if the document was strictly valid JSON with zero tolerance applied */
  strictlyValid: boolean;
}
