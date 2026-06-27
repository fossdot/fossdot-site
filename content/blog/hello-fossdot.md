+++
title = "Hello from fossdot.in"
description = "The site has a blog now — here's how it's built"
date = 2026-06-27
+++

This site started as a single hand-written HTML file. It still feels that way to
read, but underneath it's now a [Zola](https://www.getzola.org) project — so I can
write posts in Markdown instead of hand-rolling each page.

## Why Zola

A few things made it the obvious pick:

- **One binary, no Node.** `brew install zola` and that's the whole toolchain.
- **Markdown in, fast static HTML out.** No client-side framework, nothing to hydrate.
- **It kept the design.** The CSS and the English/Hindi toggle moved into shared
  files; the homepage looks exactly as it did before.

## How posts work

Each post is a Markdown file under `content/blog/` with a little front matter:

```toml
+++
title = "Hello from fossdot.in"
description = "The site has a blog now"
date = 2026-06-27
+++
```

Push to `main`, and a GitHub Action builds the site and publishes it. That's it.

> The best tools disappear. You think about the writing, not the build.

More soon.
