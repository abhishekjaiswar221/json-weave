import type { editor } from 'monaco-editor';

/**
 * Dark editor theme, derived from the app's own dark palette (see the
 * @theme block in index.css) rather than a borrowed theme — the editor's
 * background/foreground match the app chrome exactly, and the per-role
 * token colors are soft, low-saturation companions to the app's accent
 * green (muted on purpose: full-saturation neon over a near-black
 * background is what reads as glare on long documents full of strings).
 */
export const draculaThemeData: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // These are the fallback colors used by Monaco's stock JSON grammar (which
    // cannot itself distinguish an object key from a string value). For normal
    // documents ParseNest overlays precise per-role decorations computed from
    // its own tolerant AST — see JsonEditor's `collectDecorations` — so keys,
    // strings, numbers, booleans and null are always colored distinctly there.
    { token: '', foreground: 'EDEDEC', background: '141414' },
    { token: 'string.json', foreground: '7EC8EE' }, // soft blue — string fallback
    { token: 'number.json', foreground: 'B6A6F0' }, // soft violet — numbers
    { token: 'number.float.json', foreground: 'B6A6F0' },
    { token: 'keyword.json', foreground: 'E8B368' }, // soft amber — true/false/null fallback
    { token: 'delimiter.bracket.json', foreground: 'EDEDEC' },
    { token: 'delimiter.array.json', foreground: 'EDEDEC' },
    { token: 'delimiter.colon.json', foreground: '6E6E6C' },
    { token: 'delimiter.comma.json', foreground: '6E6E6C' },
    { token: 'comment', foreground: '6E6E6C', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#141414',
    'editor.foreground': '#EDEDEC',
    'editorLineNumber.foreground': '#6E6E6C',
    'editorLineNumber.activeForeground': '#EDEDEC',
    'editor.selectionBackground': '#123B2E',
    'editor.inactiveSelectionBackground': '#123B2E80',
    'editor.lineHighlightBackground': '#1E1E1E',
    'editorCursor.foreground': '#00E6A0',
    'editorWhitespace.foreground': '#333333',
    'editorIndentGuide.background1': '#282828',
    'editorIndentGuide.activeBackground1': '#3F3F3F',
    'editorBracketMatch.background': '#00E6A01a',
    'editorBracketMatch.border': '#00E6A060',
    'editorGutter.background': '#141414',
    'editorError.foreground': '#F16565',
    'editorWarning.foreground': '#F0B64C',
    'editorInfo.foreground': '#63B3F2',
    'editorOverviewRuler.errorForeground': '#F16565',
    'editorOverviewRuler.warningForeground': '#F0B64C',
    'scrollbarSlider.background': '#3F3F3F80',
    'scrollbarSlider.hoverBackground': '#4D4D4DA0',
    'minimap.background': '#141414',
  },
};

export const DRACULA_THEME_NAME = 'parsenest-dracula';
