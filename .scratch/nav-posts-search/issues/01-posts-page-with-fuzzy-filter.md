# 01: Posts page with fuzzy filter

**What to build:** A new posts page at `/posts` — the complete archive and search home for the site. It shows a page heading `Posts`, a full-content-width filter input directly beneath it, and the complete post list below (newest first, in the existing post-entry markup). Typing into the input instantly fuzzy-filters the list over post titles, tags, and excerpt text, reusing the existing search index and fuzzy matching so behaviour matches the old nav search. A reader with JavaScript disabled gets the plain complete list with no dead filter control visible.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] At any viewport, `/posts` shows the heading `Posts`, the filter input spanning the full content width below it, and the complete post list newest-first.
- [ ] Typing filters the list instantly with no submit; matching is fuzzy over title, tags, and excerpt — a near-miss or typo query still finds its post.
- [ ] Every match stays visible; there is no result cap.
- [ ] When nothing matches, the list is replaced by a single muted `no posts match` line.
- [ ] The input shows the placeholder `filter posts` and carries an accessible label.
- [ ] The filter has no URL state: navigating away or reloading clears it.
- [ ] With JavaScript disabled, the complete post list is present and no filter input is visible.
- [ ] Browser tests cover the filtering behaviour (including that matching is fuzzy) and the no-JS state; built-HTML tests cover the script-revealed input; `pnpm test` passes.
