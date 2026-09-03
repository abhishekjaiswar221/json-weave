/**
 * Colors for a JSON value's type — used to badge "Type: string" in the
 * Inspector and the inline value preview in the Tree view. Deliberately the
 * *same* hex values the editor itself uses for that type of token (see
 * components/editor/darkTheme.ts / lightTheme.ts and the .jt-* rules in
 * index.css), rather than an independently invented set — this exact
 * duplication is why these went stale before (badges kept the old Dracula
 * hex values after the editor's own colors were reworked to JetBrains'
 * scheme, silently losing contrast in light mode along the way, since the
 * old values were never tuned for it).
 *
 * Returned as a raw hex string for an inline `style`, not a Tailwind class —
 * these are computed at render time from the resolved theme, and a
 * dynamically-built `text-[${hex}]` class name isn't visible to Tailwind's
 * build-time scanner, so it would silently generate no CSS for it.
 */
const TYPE_COLOR: Record<string, { dark: string; light: string }> = {
  string: { dark: '#6a8759', light: '#846e15' },
  number: { dark: '#6897bb', light: '#0000ff' },
  boolean: { dark: '#cc7832', light: '#0000ff' },
  null: { dark: '#cc7832', light: '#0000ff' },
  object: { dark: '#cc7ab0', light: '#1a1a1a' },
  array: { dark: '#cc7ab0', light: '#1a1a1a' },
};

export function typeColorHex(type: string, resolvedTheme: 'dark' | 'light'): string | undefined {
  return TYPE_COLOR[type]?.[resolvedTheme];
}
