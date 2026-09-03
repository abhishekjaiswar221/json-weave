import type { editor } from 'monaco-editor';

/**
 * Dark editor theme, modeled on the JSON syntax colors JetBrains IDEs show
 * out of the box (Darcula): rose/pink property keys, green strings, orange
 * true/false/null, blue numbers, gold braces, and everything else — colons,
 * commas, brackets — left at plain foreground rather than an off-palette
 * accent color. Background/gutter/selection/cursor stay the app's own dark
 * tokens (see the @theme block in index.css) rather than the JetBrains
 * editor canvas, so the surrounding chrome and the editor read as one piece.
 */
export const darkThemeData: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // These are the fallback colors used by Monaco's stock JSON grammar (which
    // cannot itself distinguish an object key from a string value). For normal
    // documents JSONWeave overlays precise per-role decorations computed from
    // its own tolerant AST — see JsonEditor's `collectDecorations` — so keys,
    // strings, numbers, booleans and null are always colored distinctly there.
    { token: '', foreground: 'A9B7C6', background: '141414' },
    { token: 'string.json', foreground: '6A8759' }, // green — string fallback
    { token: 'number.json', foreground: '6897BB' }, // blue — numbers
    { token: 'number.float.json', foreground: '6897BB' },
    { token: 'keyword.json', foreground: 'CC7832' }, // orange — true/false/null fallback
    { token: 'delimiter.bracket.json', foreground: 'FFC66D' }, // gold — braces
    { token: 'delimiter.array.json', foreground: 'A9B7C6' },
    { token: 'delimiter.colon.json', foreground: 'A9B7C6' },
    { token: 'delimiter.comma.json', foreground: 'A9B7C6' },
    { token: 'comment', foreground: '808080', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#141414',
    'editor.foreground': '#A9B7C6',
    'editorLineNumber.foreground': '#606366',
    'editorLineNumber.activeForeground': '#A9B7C6',
    'editor.selectionBackground': '#214283',
    'editor.inactiveSelectionBackground': '#21428380',
    'editor.lineHighlightBackground': '#1E1E1E',
    'editorCursor.foreground': '#5FBE93',
    'editorWhitespace.foreground': '#333333',
    'editorIndentGuide.background1': '#282828',
    'editorIndentGuide.activeBackground1': '#3F3F3F',
    'editorBracketMatch.background': '#5FBE931a',
    'editorBracketMatch.border': '#5FBE9360',
    'editorGutter.background': '#141414',
    'editorError.foreground': '#F16565',
    'editorWarning.foreground': '#CC7832',
    'editorInfo.foreground': '#6897BB',
    'editorOverviewRuler.errorForeground': '#F16565',
    'editorOverviewRuler.warningForeground': '#CC7832',
    'scrollbarSlider.background': '#3F3F3F80',
    'scrollbarSlider.hoverBackground': '#4D4D4DA0',
    'minimap.background': '#141414',
  },
};

export const DARK_THEME_NAME = 'jsonweave-dark';
