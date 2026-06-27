# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file static personal site for Vishal Arya (fossdot.in), deployed at
`github.com/fossdot/fossdot-site`. The entire site is one self-contained HTML
file — `index.html` — with inlined CSS and JS and no build step, no
dependencies, and no framework.

## Running locally

Serve the directory over HTTP (needed so `localStorage` works as expected):

```sh
python3 -m http.server 4321
```

Then open `http://localhost:4321/`. This matches the `.claude/launch.json` config.

## Architecture

Everything lives in the one HTML file:

- **Theming** (`:root` CSS custom properties): light palette by default, dark
  palette applied either via `prefers-color-scheme` (unless the user forced
  light) or an explicit `data-theme` attribute on `<html>`. The theme toggle
  writes `data-theme` and persists it to `localStorage` under `theme`.
- **Bilingual content (English / Hindi)**: every translatable element carries a
  `data-hi` attribute holding its Hindi HTML. On load, the script snapshots each
  element's current `innerHTML` into `data-en`, then swaps `innerHTML` between
  `data-en` and `data-hi` based on the `lang` preference (persisted to
  `localStorage` under `lang`). `data-hi` values contain inline HTML (links,
  spans), so they are injected as HTML, not text.

### When editing content

Any text change must be made in **both** the visible English markup **and** the
matching `data-hi` attribute, or the two languages will drift. The visible
default markup is the English source of truth; `data-en` is derived from it at
runtime, so never set `data-en` by hand.
