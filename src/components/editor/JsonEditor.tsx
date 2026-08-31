import { useCallback, useEffect, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useUiStore } from '../../store/uiStore';
import { findPathAtOffset } from '../../lib/parser/tolerantParser';
import { draculaThemeData, DRACULA_THEME_NAME } from './draculaTheme';
import type { AstNode, ObjectProperty } from '../../lib/parser/types';

function collectDecorations(monaco: typeof Monaco, model: Monaco.editor.ITextModel, ast: AstNode | undefined) {
  const decorations: Monaco.editor.IModelDeltaDecoration[] = [];
  if (!ast) return decorations;

  const rangeFor = (node: { start: { offset: number }; end: { offset: number } }) => {
    const start = model.getPositionAt(node.start.offset);
    const end = model.getPositionAt(node.end.offset);
    return new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column);
  };

  const addKey = (prop: ObjectProperty) => {
    decorations.push({ range: rangeFor(prop.keyNode), options: { inlineClassName: 'jt-key' } });
  };

  const walk = (node: AstNode) => {
    switch (node.type) {
      case 'object':
        for (const prop of node.properties) {
          addKey(prop);
          walk(prop.valueNode);
        }
        break;
      case 'array':
        for (const item of node.items) walk(item);
        break;
      case 'string':
        decorations.push({ range: rangeFor(node), options: { inlineClassName: 'jt-string' } });
        break;
      case 'number':
        decorations.push({ range: rangeFor(node), options: { inlineClassName: 'jt-number' } });
        break;
      case 'boolean':
        decorations.push({ range: rangeFor(node), options: { inlineClassName: 'jt-boolean' } });
        break;
      case 'null':
        decorations.push({ range: rangeFor(node), options: { inlineClassName: 'jt-null' } });
        break;
    }
  };
  walk(ast);
  return decorations;
}

let themeRegistered = false;

export function JsonEditor() {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const decorationIds = useRef<string[]>([]);

  const source = useWorkspaceStore((s) => s.source);
  const ast = useWorkspaceStore((s) => s.ast);
  const diagnostics = useWorkspaceStore((s) => s.diagnostics);
  const setSource = useWorkspaceStore((s) => s.setSource);
  const selectPath = useWorkspaceStore((s) => s.selectPath);
  const jumpToOffset = useWorkspaceStore((s) => s.jumpToOffset);
  const clearJump = useWorkspaceStore((s) => s.clearJump);
  const editorSettings = useUiStore((s) => s.settings.editor);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    if (!themeRegistered) {
      monaco.editor.defineTheme(DRACULA_THEME_NAME, draculaThemeData);
      themeRegistered = true;
    }
    monaco.editor.setTheme(DRACULA_THEME_NAME);

    editor.onDidChangeCursorPosition((e) => {
      const model = editor.getModel();
      if (!model) return;
      const offset = model.getOffsetAt(e.position);
      const currentAst = useWorkspaceStore.getState().ast;
      const path = findPathAtOffset(currentAst, offset);
      if (path) selectPath(path);
    });
  }, [selectPath]);

  // markers
  useEffect(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (!model) return;

    const severityMap: Record<string, Monaco.MarkerSeverity> = {
      error: monaco.MarkerSeverity.Error,
      warning: monaco.MarkerSeverity.Warning,
      info: monaco.MarkerSeverity.Info,
    };

    const markers: Monaco.editor.IMarkerData[] = diagnostics
      .filter((d) => d.severity !== 'info')
      .map((d) => ({
        severity: severityMap[d.severity],
        message: d.message + (d.detail ? `\n${d.detail}` : ''),
        startLineNumber: d.start.line,
        startColumn: d.start.column,
        endLineNumber: d.end.line,
        endColumn: Math.max(d.end.column, d.start.column + 1),
      }));

    monaco.editor.setModelMarkers(model, 'parsenest', markers);
  }, [diagnostics]);

  // key/value decorations from our tolerant AST
  useEffect(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (!model) return;
    const decorations = collectDecorations(monaco, model, ast);
    decorationIds.current = editor.deltaDecorations(decorationIds.current, decorations);
  }, [ast, source]);

  // jump to offset requests (from diagnostics panel / search)
  useEffect(() => {
    if (jumpToOffset === null) return;
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;
    const position = model.getPositionAt(jumpToOffset);
    editor.revealPositionInCenter(position);
    editor.setPosition(position);
    editor.focus();
    clearJump();
  }, [jumpToOffset, clearJump]);

  // live settings
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.updateOptions({
      fontSize: editorSettings.fontSize,
      tabSize: editorSettings.tabSize,
      wordWrap: editorSettings.wordWrap ? 'on' : 'off',
      minimap: { enabled: editorSettings.minimap },
      lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
      matchBrackets: editorSettings.bracketMatching ? 'always' : 'never',
      fontLigatures: editorSettings.ligatures,
    });
  }, [editorSettings]);

  return (
    <div className="editor-dracula h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="json"
        value={source}
        onMount={handleMount}
        onChange={(value) => setSource(value ?? '')}
        theme={DRACULA_THEME_NAME}
        options={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: editorSettings.fontSize,
          fontLigatures: editorSettings.ligatures,
          tabSize: editorSettings.tabSize,
          insertSpaces: true,
          wordWrap: editorSettings.wordWrap ? 'on' : 'off',
          minimap: { enabled: editorSettings.minimap },
          lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
          matchBrackets: editorSettings.bracketMatching ? 'always' : 'never',
          renderLineHighlight: 'line',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          padding: { top: 14, bottom: 14 },
          automaticLayout: true,
          quickSuggestions: false,
          folding: true,
          renderWhitespace: 'selection',
          guides: { indentation: true, bracketPairs: false },
        }}
      />
    </div>
  );
}
