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
- **Keyboard-first.** `Cmd/Ctrl+K` command palette, plus the shortcuts you'd
  expect for format, minify, search, save and open.

## Stack

React + TypeScript + Tailwind CSS v4 + Monaco Editor (self-hosted, JSON-only
build — not the CDN default) + Zustand + Vite. See `src/lib/` for the
framework-agnostic core (parser, formatter, repair, search, JSON path, diff,
conversion) and `src/components/` for the UI built on top of it.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build locally
```

## Project layout

```text
src/
  components/    editor, tree, inspector, toolbar, command-palette,
                 diagnostics, landing, import, export, settings, table, diff
  lib/           parser, formatter, validator/repair, search, json-path,
                 diff, storage, convert — all UI-independent
  store/         zustand stores (workspace document state, UI/settings state)
  pages/         Landing, Workspace
  workers/       off-main-thread parsing for large documents
```
