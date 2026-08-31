// Self-hosts Monaco from the locally bundled package instead of letting
// @monaco-editor/react lazy-fetch it from a CDN at runtime — consistent with
// JSONWeave's "everything runs in your browser, nothing phones out" story.
// Import only the editor core + JSON language contribution (not the barrel
// `monaco-editor` entry, which registers every language Monaco ships and
// balloons the bundle by several MB for a JSON-only editor).
import * as monaco from 'monaco-editor/editor/editor.api';
import 'monaco-editor/language/json/monaco.contribution';
import editorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import jsonWorker from 'monaco-editor/language/json/json.worker.js?worker';
import { loader } from '@monaco-editor/react';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'json') return new jsonWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });
