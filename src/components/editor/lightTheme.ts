import type { editor } from 'monaco-editor';

/**
 * Light counterpart to the dark editor theme (see darkTheme.ts), modeled on
 * JetBrains' own default *light* JSON color scheme rather than a derived
 * palette: string values green, true/false/null and numbers blue — and,
 * matching that scheme's actual behavior, property keys, braces, colons and
 * commas are all left at plain foreground rather than given their own
 * color (JetBrains' light scheme only distinguishes literal values, not
 * structure). Background/gutter/selection/cursor stay the app's own light
 * tokens rather than the JetBrains editor canvas, so the surrounding chrome
 * and the editor read as one piece. Normal documents get their actual
 * colors from JSONWeave's own tolerant AST (see JsonEditor's
 * `collectDecorations`, and the `.editor-json.light` overrides in
 * index.css) — the rules below are just the stock-grammar fallback.
 */
export const lightThemeData: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: '', foreground: '1A1A1A', background: 'FFFFFF' },
    { token: 'string.json', foreground: '008000' }, // green — string fallback
    { token: 'number.json', foreground: '0000FF' }, // blue — numbers
    { token: 'number.float.json', foreground: '0000FF' },
    { token: 'keyword.json', foreground: '0000FF' }, // blue — true/false/null fallback
    { token: 'delimiter.bracket.json', foreground: '1A1A1A' },
    { token: 'delimiter.array.json', foreground: '1A1A1A' },
    { token: 'delimiter.colon.json', foreground: '1A1A1A' },
    { token: 'delimiter.comma.json', foreground: '1A1A1A' },
    { token: 'comment', foreground: '808080', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#1A1A1A',
    'editorLineNumber.foreground': '#ADADAD',
    'editorLineNumber.activeForeground': '#1A1A1A',
    'editor.selectionBackground': '#D1FAE5',
    'editor.inactiveSelectionBackground': '#D1FAE580',
    'editor.lineHighlightBackground': '#F5F5F6',
    'editorCursor.foreground': '#059669',
    'editorWhitespace.foreground': '#E4E4E7',
    'editorIndentGuide.background1': '#E4E4E7',
    'editorIndentGuide.activeBackground1': '#C7C7CC',
    'editorBracketMatch.background': '#05966920',
    'editorBracketMatch.border': '#05966980',
    'editorGutter.background': '#FFFFFF',
    'editorError.foreground': '#DC2626',
    'editorWarning.foreground': '#B45309',
    'editorInfo.foreground': '#0000FF',
    'editorOverviewRuler.errorForeground': '#DC2626',
    'editorOverviewRuler.warningForeground': '#B45309',
    'scrollbarSlider.background': '#D4D4D880',
    'scrollbarSlider.hoverBackground': '#B4B6C2A0',
    'minimap.background': '#FFFFFF',
  },
};

export const LIGHT_THEME_NAME = 'jsonweave-light';
