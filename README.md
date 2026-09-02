# JSONWeave

A local-first, developer-grade JSON workspace. Open, format, explore, search,
inspect and repair JSON without fighting a wall of text — entirely in your
browser.

**Whoa, this is a JSON tool?** — that's the point. JSONWeave isn't another
paste-and-format utility; it's a workspace built around the moment a JSON
document is slightly broken, and the moment after that where you actually
need to understand what's inside it.

## What makes it different

- **Partial JSON understanding.** A custom recursive-descent tolerant parser
  (`src/lib/parser`) never gives up on malformed input — it recovers a
  best-effort document and explains *what* looks wrong, in plain language:
  "Possible trailing comma after `"age": 25`", "Key `name` is not quoted.",
  "String appears to be missing a closing quote."
- **Repair, not silent mutation.** Repair mode lists every issue found and
  lets you preview the fixed document before anything in the editor changes.
- **Inspector-first workflow.** Select any value — in the editor or the tree
  — to see its type, JSON path, length, and smart previews (URLs, emails,
  ISO dates, hex colors, and JWTs decoded entirely client-side).
  Code → Tree → Overview → Table → Diff — five ways to look at the same
  document, switchable instantly.
- **Privacy by architecture.** Parsing, formatting, searching and repair all
  run in your browser. Nothing is uploaded unless you explicitly use "Open
  from URL", which fetches directly from your browser to that address.
- **Keyboard-first.** `Cmd/Ctrl+K` opens the command palette from anywhere in
  the workspace — including with the editor itself focused — plus the
  shortcuts you'd expect for format, minify, search, save and open. The
  palette lists every command's shortcut next to it.
- **The workspace *is* the app.** `/` opens straight into the editor, no
  marketing page in front of it — paste JSON and go. The product pitch,
  feature list and full shortcut reference live at `/features` instead.
- **JSON coloring modeled on JetBrains' own IDE schemes.** Dark follows
  Darcula's JSON colors (rose keys, green strings, orange booleans/null,
  gold braces); light follows JetBrains' default light scheme (only string
  and boolean/null literals get a color — keys and structure stay plain
  text, same as it renders there). Background/selection/cursor stay the
  app's own tokens either way; only the syntax colors borrow from JetBrains
  (`src/components/editor/darkTheme.ts` / `lightTheme.ts`).
- **System-aware theming.** Appearance defaults to your OS preference, with
  explicit Light/Dark overrides that persist and switch via an animated
  circular reveal (skipped under `prefers-reduced-motion`).

## Stack

React + TypeScript + React Router + Tailwind CSS v4 + Monaco Editor
(self-hosted, JSON-only build — not the CDN default) + Zustand + Vite. See
`src/lib/` for the framework-agnostic core (parser, formatter, repair,
search, JSON path, diff, conversion) and `src/components/` for the UI built
on top of it.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build locally
```

## Routes

| Route | Renders |
|---|---|
| `/` | The workspace — editor, tree, inspector, search, command palette. Loaded eagerly; nothing gates access to it. |
| `/features` | The informational page — what it does, why, and the keyboard shortcut reference. Code-split, since it's secondary traffic. |
| `/workspace` | Redirects to `/` (kept for old links). |

## Project layout

```text
src/
  components/    editor, tree, inspector, toolbar, command-palette,
                 search, diagnostics, import, export, settings, table, diff
  lib/           parser, formatter, validator/repair, search, json-path,
                 diff, storage, convert, seo — all UI-independent
  hooks/         keyboard shortcuts, focus trap, theme sync, document meta
  store/         zustand stores (workspace document state, UI/settings state)
  pages/         Workspace (/), Features (/features)
  workers/       off-main-thread parsing for large documents
```

## SEO

This is a client-rendered SPA, so there's a ceiling on what on-page changes
can do for crawlers that don't execute JS — `robots.txt` and
`public/sitemap.xml` cover the mechanical baseline, and the canonical link,
title and meta description update per route (`src/hooks/useDocumentMeta.ts`).
The deployed origin lives in one place: `src/lib/seo.ts`.
