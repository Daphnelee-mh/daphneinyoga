# daphneinyoga

Source for [daphneinyoga.com](https://daphneinyoga.com), a static site served by GitHub Pages (no build step).

## Structure

```
index.html, blog.html, reading.html, practice.html, about.html   main pages
404.html                    page shown for unknown URLs
header.html, footer.html    shared nav and footer, inserted by script.js
style.css                   the only stylesheet (design tokens at the top)
script.js                   shared JS: header/footer, menu, Gita tabs and notes
posts/                      blog posts
practices/                  breathing practices
  breathing-engine.js       shared timer used by every practice
  box-breathing.js          box breathing pattern + square path
  437-breathing.js          4-3-7 pattern + triangle path
assets/images/              images (keep photos under ~300 KB)
sitemap.xml, robots.txt     for search engines
```

The root-level `*.html` files named after posts (e.g. `vipassana.html`) are
redirects to `posts/`, kept so older links still work.

## Adding a blog post

1. Copy an existing file in `posts/` (e.g. `posts/learning-to-see.html`).
2. Update the `<title>`, `description`, `canonical` and `og:` tags in `<head>`.
3. Replace the article content.
4. Add a card for it to `blog.html` (and to the home page if it should be featured).
5. Add its URL to `sitemap.xml`.

Use root-relative paths (`/style.css`, `/assets/images/...`) everywhere.

## Previewing locally

The header and footer are loaded with `fetch`, so open the site through a
local server rather than double-clicking a file:

    python3 -m http.server

then visit http://localhost:8000.
