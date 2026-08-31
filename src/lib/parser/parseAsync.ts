import type { Diagnostic, JsonValue } from './types';

export interface AsyncParseResult {
  value: JsonValue | undefined;
  diagnostics: Diagnostic[];
  strictlyValid: boolean;
}

let worker: Worker | undefined;
let reqId = 0;
const pending = new Map<number, (r: AsyncParseResult) => void>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../../workers/parse.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<AsyncParseResult & { id: number }>) => {
      const resolve = pending.get(e.data.id);
      if (resolve) {
        pending.delete(e.data.id);
        resolve(e.data);
      }
    };
  }
  return worker;
}

/** Parses off the main thread. Used for large documents so the UI never freezes. */
export function parseInWorker(source: string): Promise<AsyncParseResult> {
  const id = ++reqId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    getWorker().postMessage({ id, source });
  });
}

/** Threshold above which we route parsing through the worker instead of the main thread. */
export const LARGE_DOC_THRESHOLD = 800_000; // ~800 KB
