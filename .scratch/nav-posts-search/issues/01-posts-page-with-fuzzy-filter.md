# 01: Posts page with fuzzy filter

**What to build:** A new posts page at `/posts` — the complete archive and search home for the site. It shows a page heading `Posts`, a full-content-width filter input directly beneath it, and the complete post list below (newest first, in the existing post-entry markup). Typing into the input instantly fuzzy-filters the list over post titles, tags, and excerpt text, reusing the existing search index and fuzzy matching so behaviour matches the old nav search. A reader with JavaScript disabled gets the plain complete list with no dead filter control visible.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] At any viewport, `/posts` shows the heading `Posts`, the filter input spanning the full content width below it, and the complete post list newest-first.
- [x] Typing filters the list instantly with no submit; matching is fuzzy over title, tags, and excerpt — a near-miss or typo query still finds its post.
- [x] Every match stays visible; there is no result cap.
- [x] When nothing matches, the list is replaced by a single muted `no posts match` line.
- [x] The input shows the placeholder `filter posts` and carries an accessible label.
- [x] The filter has no URL state: navigating away or reloading clears it.
- [x] With JavaScript disabled, the complete post list is present and no filter input is visible.
- [x] Browser tests cover the filtering behaviour (including that matching is fuzzy) and the no-JS state; built-HTML tests cover the script-revealed input; `pnpm test` passes.

## Answer

Implemented on `integration/nav-posts-search` (feature commit `9954a82`, merged `9475ff4`; code-review fixes `b1844d1`). New `src/pages/posts.astro`: heading `Posts`, full-content-width mono filter input beneath it (script-revealed via `hidden`; placeholder `filter posts`; accessible label), the complete post list newest-first in the existing post-entry markup, and instant fuzzy filtering over the `/search-index.json` index (fuse.js, `keys: ['title','tags','excerpt']`, `threshold: 0.3` — the old nav search's contract verbatim), no result cap, no URL state, muted `no posts match` line. Browser tests in `tests/browser/posts-page.spec.ts`; built-HTML tests in `tests/html/posts-page.test.mjs`. `pnpm test` green modulo the pre-existing accepted red (`tests/html/footer.test.mjs` CC badge — maintainer decision in `.scratch/teal-accent/spec.md`).

## Comments

- With JavaScript disabled the input and the empty line render with the `hidden` attribute; the filtering script removes the input's `hidden` as its first act, before fetching the index — so the wiring reveals the control, not the async index load.
- The empty-result line is keyed off the count of visible rendered entries, not the fuse match set (code-review finding): an index/render mismatch must yield `no posts match`, never a blank list.
- Post identity is carried by a `data-post-slug` attribute on each entry (code-review fix) instead of parsing the href shape.
- "No result cap" is asserted with the live 2-post set (a query matching both keeps both visible); richer cap evidence comes from ticket 03's fixture-generated content set.
