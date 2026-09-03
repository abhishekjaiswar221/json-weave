import type { editor } from 'monaco-editor';

/**
 * Dark editor theme, modeled on the JSON syntax colors JetBrains IDEs show
 * out of the box (Darcula): rose/pink property keys, green strings, orange
 * true/false/null, blue numbers, gold braces, and everything else — colons,
 * commas, brackets — left at plain foreground rather than an off-palette
 * accent color. Background/gutter/selection/cursor stay the app's own dark
 * tokens (see the @theme block in index.css) rather than the JetBrains
 * editor canvas, so the surrounding chrome and the editor read as one piece.
 *
 * For normal documents the visible text is actually colored by
 * JSONWeave's own AST-based decorations (JsonEditor's
 * `collectDecorations`), not these token rules directly — but the rules
 * still have to be right, since the minimap bypasses those decorations
 * entirely and paints straight from tokenizer + rules.
 */
export const darkThemeData: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // These aren't just a "typing" fallback for odd cases — they're what the
    // minimap actually renders from (it paints straight from the tokenizer +
    // these rules, never from the DOM decorations `collectDecorations`
    // applies to the visible text), so getting the real token names right
    // matters even though the main view always looks correct regardless.
    // Verified against monaco-editor's own JSON tokenizer source
    // (languages/features/json/tokenization.js) rather than guessed —
    // notably strings are `string.value.json`, not `string.json` (that
    // token doesn't exist), and keys are their own `string.key.json`,
    // distinct from string values.
    { token: '', foreground: 'A9B7C6', background: '141414' },
    { token: 'string.key.json', foreground: 'CC7AB0' }, // rose — object keys
    { token: 'string.value.json', foreground: '6A8759' }, // green — string values
    { token: 'number.json', foreground: '6897BB' }, // blue — numbers
    { token: 'keyword.json', foreground: 'CC7832' }, // orange — true/false/null
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
