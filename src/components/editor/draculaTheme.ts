import type { editor } from 'monaco-editor';

/**
 * Dracula-inspired theme, adapted for JSON specifically (per-role token colors)
 * rather than a blanket import of the stock Dracula palette. Scoped to the
 * editor only — the surrounding app chrome uses its own neutral SaaS palette.
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
    { token: '', foreground: 'F8F8F2', background: '282A36' },
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
    'editor.background': '#282A36',
    'editor.foreground': '#F8F8F2',
    'editorLineNumber.foreground': '#6272A4',
    'editorLineNumber.activeForeground': '#F8F8F2',
    'editor.selectionBackground': '#44475A',
    'editor.inactiveSelectionBackground': '#44475A80',
    'editor.lineHighlightBackground': '#2E3040',
    'editorCursor.foreground': '#F8F8F2',
    'editorWhitespace.foreground': '#424450',
    'editorIndentGuide.background1': '#3B3D4D',
    'editorIndentGuide.activeBackground1': '#565872',
    'editorBracketMatch.background': '#44475A80',
    'editorBracketMatch.border': '#8BE9FD60',
    'editorGutter.background': '#282A36',
    'editorError.foreground': '#FF5555',
    'editorWarning.foreground': '#FFB86C',
    'editorInfo.foreground': '#8BE9FD',
    'editorOverviewRuler.errorForeground': '#FF5555',
    'editorOverviewRuler.warningForeground': '#FFB86C',
    'scrollbarSlider.background': '#44475A80',
    'scrollbarSlider.hoverBackground': '#565872A0',
    'minimap.background': '#282A36',
  },
};

export const DRACULA_THEME_NAME = 'parsenest-dracula';
