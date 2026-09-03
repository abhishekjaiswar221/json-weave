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
import { darkThemeData, DARK_THEME_NAME } from '../components/editor/darkTheme';
import { lightThemeData, LIGHT_THEME_NAME } from '../components/editor/lightTheme';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'json') return new jsonWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });

// Registered here — at module init, before any <Editor> ever mounts — rather
// than in JsonEditor's onMount. @monaco-editor/react's onMount callback fires
// *after* monaco.editor.create() has already run with the requested theme
// name, so on the very first editor a session ever creates, that name wasn't
// registered yet: Monaco silently fell back to its own built-in default (a
// light theme) for that first paint, then JsonEditor's setTheme corrected it
// a moment later — a visible white-then-dark flash every time the editor
// went from unmounted (EmptyState, or the Table/Diff views, which unmount
// it) to mounted with a document. Defining both here means the theme is
// already valid the first time create() is ever called.
monaco.editor.defineTheme(DARK_THEME_NAME, darkThemeData);
monaco.editor.defineTheme(LIGHT_THEME_NAME, lightThemeData);
