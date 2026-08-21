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
- **Client-side EN/HI switcher** (not Zola i18n): translatable elements carry a
  `data-hi` attribute holding their Hindi HTML. `app.js` snapshots each element's
  English `innerHTML` into `data-en` on load, then swaps `innerHTML` between the
  two when the language changes (persisted in `localStorage`). Elements without a
  `data-hi` stay in English.
  The control itself is a segmented picker — a `role="radiogroup"` of `.langopt`
  buttons in `base.html`, showing both languages at once with the active one
  marked by `aria-checked`. `app.js` keeps `aria-checked` and a roving `tabindex`
  in sync, so arrow keys move within the group and it is one tab stop.
- **Posts are translated through that same switcher.** A post's Hindi body lives
  in `translations/hi/<slug>.md` (plain Markdown, no front matter);
  `page.html` renders it with `load_data` + the `markdown` filter into the
  `data-hi` of the `.postbody` wrapper. The attribute — rather than a second
  hidden copy of the article — is deliberate: only one language is ever in the
  DOM, so the two bodies cannot collide over footnote ids. The post's `[extra]`
  carries `title_hi` and `description_hi`, which cover the `<h1>` and the row in
  every listing. Dates come from the `date` filter's `locale="hi_IN"`.

Homepage list items follow a fixed shape — a single `<a>` wrapping a
`.item-name` and an optional `.desc` (plus `.item-head`/`.item-date` for dated
blog rows). The whole row is the link target, so keep new items in that shape
rather than putting the anchor around the name alone. A section marked
`.full` spans both grid columns.

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
- `translations/hi/<slug>.md` — the Hindi body of a post. Outside `content/` on
  purpose: it is data for a template, not a page of its own, so Zola must not
  render or list it.

**Link posts.** Writing published on Bodhya or FOSS United is listed alongside
local posts as a stub with no body:

```toml
template = "external.html"
[extra]
external_url = "https://fossunited.org/blog/..."
source = "FOSS United"
```

The listings link straight to `external_url` and badge it with `source`; the
local URL renders via `external.html` as a `noindex` redirect so it is not a dead
end. Because they are ordinary pages, the section's `sort_by = "date"` interleaves
them with local posts for free. Note `render = false` would drop them from
`section.pages` altogether — that is why they use a redirect template instead.

## Editing

- **Homepage text** must be changed in *both* the visible English markup *and* the
  matching `data-hi` attribute, or the two languages drift. Never set `data-en` by
  hand — `app.js` derives it from the English markup at runtime.
- **New post**: add `content/blog/<slug>.md` with `title`, `description`, `date`.
  It appears automatically on `/blog` and (latest 3) on the homepage.
- **Every post ships in both languages.** A new post is not finished until it has
  `translations/hi/<slug>.md` plus `title_hi` and `description_hi` in `[extra]`;
  without them the language switcher does nothing on that page. Translate as an
  adaptation, not word for word — match the English register (plain, first
  person, understated) and keep the everyday Hindi/Hinglish a reader here
  actually uses (`स्कूल`, `क्लास 10`, `टीचर`, `साइंस`) over formal Sanskritised
  vocabulary. Keep the footnotes, links and image alt text in the Hindi body too.
- **No em dashes in post prose**, in either language. Use a comma, or recast the
  sentence. (The one in a link post's title is the title it was published under
  elsewhere, so it stays.)

## Deploying

Served at the `fossdot.in` custom domain. `base_url` is `https://fossdot.in`,
the apex is pinned by `static/CNAME`, and DNS lives at Namecheap (four A records
on `@` → GitHub Pages IPs `185.199.108-111.153`, plus `www` CNAME →
`fossdot.github.io`). Pushing to `main` rebuilds and redeploys via Actions.
