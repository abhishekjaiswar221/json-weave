import { parseTolerant } from '../lib/parser/tolerantParser';

export interface ParseRequest {
  id: number;
  source: string;
}

self.onmessage = (e: MessageEvent<ParseRequest>) => {
  const { id, source } = e.data;
  const result = parseTolerant(source);
  // AST nodes can be large/circular-free but still heavy; only ship value+diagnostics,
  // the AST itself is not needed outside the worker for the UI we render.
  (self as unknown as Worker).postMessage({
    id,
    value: result.value,
    diagnostics: result.diagnostics,
    strictlyValid: result.strictlyValid,
  });
};
