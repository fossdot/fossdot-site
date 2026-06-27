# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The personal site for Vishal Arya (fossdot.in), built with the **Zola** static
site generator (a single Rust binary, no Node). It is deployed to GitHub Pages by
the workflow in `.github/workflows/pages.yml` on every push to `main`.

## Commands

- `zola serve` — local dev server with live reload at http://127.0.0.1:1111
- `zola build` — render the site into `public/` (the deploy artifact; gitignored)
- `zola check` — validate internal links and content

Install Zola with `brew install zola` if it's missing.

## Architecture

A conventional Zola project, with two non-obvious things carried over from the
site's hand-built origins — keep both working when editing templates:

- **Shared design lives in `static/`**: all styling is in `static/style.css` and
  all behaviour in `static/app.js` (plain files — no Sass, no JS bundling). Every
  page links them via `templates/base.html`. CSS custom properties on `:root`
  drive the light/dark palette. Homepage-only selectors are scoped under
  `.sections` so Markdown post content (`.post`) gets normal article styling
  instead of the homepage's list/eyebrow styles.
- **Client-side EN/HI toggle** (not Zola i18n): translatable elements carry a
  `data-hi` attribute holding their Hindi HTML. `app.js` snapshots each element's
  English `innerHTML` into `data-en` on load, then swaps `innerHTML` between the
  two on toggle (persisted in `localStorage`). Elements without a `data-hi`
  (e.g. the auto-listed blog entries on the homepage) simply stay in English.

### Templates

- `base.html` — skeleton: `<head>`, top controls, footer, asset links; defines
  the `title`, `description`, and `content` blocks.
- `index.html` — homepage; hand-authored bilingual sections, plus a Blog section
  that auto-lists the latest posts via `get_section`.
- `section.html` — the `/blog` index (lists all posts).
- `page.html` — a single post.

### Content

- `content/blog/*.md` — posts (Markdown + TOML front matter).
- `content/blog/_index.md` — configures the section (`sort_by = "date"`).
- `content/_index.md` — homepage front matter (the markup is in `index.html`).

## Editing

- **Homepage text** must be changed in *both* the visible English markup *and* the
  matching `data-hi` attribute, or the two languages drift. Never set `data-en` by
  hand — `app.js` derives it from the English markup at runtime.
- **New post**: add `content/blog/<slug>.md` with `title`, `description`, `date`.
  It appears automatically on `/blog` and (latest 3) on the homepage.

## Deploying

`base_url` in `config.toml` is currently the GitHub Pages project URL. To move to
the `fossdot.in` custom domain: set `base_url = "https://fossdot.in"`, add a
`static/CNAME` file containing `fossdot.in`, set the domain under repo
Settings → Pages, and point DNS at GitHub Pages.
