import type { editor } from 'monaco-editor';

/**
 * Light counterpart to the Dracula-inspired editor theme (see draculaTheme.ts).
 * Same per-role approach: Monaco's stock JSON grammar can't tell an object key
 * from a string value, so these rules are just a readable fallback — normal
 * documents get precise per-role decorations from ParseNest's own tolerant AST
 * (see JsonEditor's `collectDecorations`, and the `.editor-dracula.light`
 * overrides in index.css for the actual key/string/number/boolean/null colors).
 */
export const lightThemeData: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: '', foreground: '24252B', background: 'FFFFFF' },
    { token: 'string.json', foreground: '15803D' }, // green — string fallback
    { token: 'number.json', foreground: '7C3AED' }, // purple — numbers
    { token: 'number.float.json', foreground: '7C3AED' },
    { token: 'keyword.json', foreground: 'B45309' }, // amber — true/false/null fallback
    { token: 'delimiter.bracket.json', foreground: '24252B' },
    { token: 'delimiter.array.json', foreground: '24252B' },
    { token: 'delimiter.colon.json', foreground: '8B8D9B' },
    { token: 'delimiter.comma.json', foreground: '8B8D9B' },
    { token: 'comment', foreground: '8B8D9B', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#24252B',
    'editorLineNumber.foreground': '#B4B6C2',
    'editorLineNumber.activeForeground': '#24252B',
    'editor.selectionBackground': '#E4E4E7',
    'editor.inactiveSelectionBackground': '#E4E4E780',
    'editor.lineHighlightBackground': '#F5F5F6',
    'editorCursor.foreground': '#7C6FF0',
    'editorWhitespace.foreground': '#E4E4E7',
    'editorIndentGuide.background1': '#ECECEF',
    'editorIndentGuide.activeBackground1': '#D4D4D8',
    'editorBracketMatch.background': '#7C6FF01a',
    'editorBracketMatch.border': '#7C6FF060',
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
