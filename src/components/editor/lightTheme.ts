import type { editor } from 'monaco-editor';

/**
 * Light counterpart to the dark editor theme (see draculaTheme.ts), using
 * the same role-color mapping (key=green, string=blue, number=violet,
 * boolean=amber, null=rose) darkened enough for solid contrast on white —
 * punctuation and line numbers in particular are deliberately darker than a
 * typical "muted" grey, since a light grey on white is what reads as dim.
 * Normal documents get their actual colors from ParseNest's own tolerant AST
 * (see JsonEditor's `collectDecorations`, and the `.editor-dracula.light`
 * overrides in index.css) — the rules below are just the stock-grammar
 * fallback.
 */
export const lightThemeData: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: '', foreground: '24252B', background: 'FFFFFF' },
    { token: 'string.json', foreground: '0369A1' }, // blue — string fallback
    { token: 'number.json', foreground: '6D28D9' }, // violet — numbers
    { token: 'number.float.json', foreground: '6D28D9' },
    { token: 'keyword.json', foreground: '92400E' }, // amber — true/false/null fallback
    { token: 'delimiter.bracket.json', foreground: '24252B' },
    { token: 'delimiter.array.json', foreground: '24252B' },
    { token: 'delimiter.colon.json', foreground: '475569' },
    { token: 'delimiter.comma.json', foreground: '475569' },
    { token: 'comment', foreground: '475569', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#24252B',
    'editorLineNumber.foreground': '#7C7F8C',
    'editorLineNumber.activeForeground': '#24252B',
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
    'editorInfo.foreground': '#0E7490',
    'editorOverviewRuler.errorForeground': '#DC2626',
    'editorOverviewRuler.warningForeground': '#B45309',
    'scrollbarSlider.background': '#D4D4D880',
    'scrollbarSlider.hoverBackground': '#B4B6C2A0',
    'minimap.background': '#FFFFFF',
  },
};

export const LIGHT_THEME_NAME = 'parsenest-light';
