import type { editor } from 'monaco-editor';

/**
 * Dark editor theme. The background/gutter/selection/cursor are the app's
 * own dark tokens (see the @theme block in index.css), but the actual JSON
 * text uses the classic Dracula palette — keys cyan, strings green, numbers
 * purple, booleans orange, null pink — rather than a custom derived scheme.
 */
export const draculaThemeData: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // These are the fallback colors used by Monaco's stock JSON grammar (which
    // cannot itself distinguish an object key from a string value). For normal
    // documents JSONWeave overlays precise per-role decorations computed from
    // its own tolerant AST — see JsonEditor's `collectDecorations` — so keys,
    // strings, numbers, booleans and null are always colored distinctly there.
    { token: '', foreground: 'F8F8F2', background: '141414' },
    { token: 'string.json', foreground: '50FA7B' }, // green — string fallback
    { token: 'number.json', foreground: 'BD93F9' }, // purple — numbers
    { token: 'number.float.json', foreground: 'BD93F9' },
    { token: 'keyword.json', foreground: 'FFB86C' }, // orange — true/false/null fallback
    { token: 'delimiter.bracket.json', foreground: 'F8F8F2' },
    { token: 'delimiter.array.json', foreground: 'F8F8F2' },
    { token: 'delimiter.colon.json', foreground: '6272A4' },
    { token: 'delimiter.comma.json', foreground: '6272A4' },
    { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#141414',
    'editor.foreground': '#F8F8F2',
    'editorLineNumber.foreground': '#6272A4',
    'editorLineNumber.activeForeground': '#F8F8F2',
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

export const DRACULA_THEME_NAME = 'jsonweave-dracula';
