# 04: Inline search

**What to build:** Inline search in the header nav bar. Fuse.js-powered fuzzy search over title, tags, and excerpt. Dropdown shows results with title + date. No separate search page.

**Blocked by:** 01-project-skeleton

**Status:** ready-for-agent

- [ ] `/search-index.json` endpoint generates JSON with `{ slug, title, tags, excerpt, date }` for all non-draft posts
- [ ] Search input in the header nav bar triggers search on input
- [ ] Fuse.js performs fuzzy matching on title, tags, and excerpt (threshold: 0.3)
- [ ] Results appear in a dropdown below the input showing title + date per row
- [ ] Clicking a result navigates to the post
- [ ] "No results found." shown in muted text when no matches
- [ ] Search index JSON is fetched once and cached client-side
