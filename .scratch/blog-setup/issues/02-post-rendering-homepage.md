# 02: Post rendering + homepage

**What to build:** Homepage shows a paginated reverse-chronological post list (20 per page, numbered pagination). Each post shows full RFC 3339 date, title, and tag pills. Clicking a post title renders the full article with prev/next links and a back-to-list link.

**Blocked by:** 01-project-skeleton

**Status:** ready-for-agent

- [ ] Homepage at `/` lists all non-draft posts in reverse chronological order
- [ ] Each list entry shows: full RFC 3339 date, title as link, tags as inline pills
- [ ] Pagination at 20 posts per page with numbered controls (`← 1 2 3 →`)
- [ ] Pagination hidden when only 1 page of posts
- [ ] `/blog/[slug]` renders full post content with syntax-highlighted code blocks
- [ ] Post page shows full RFC 3339 date in `<time datetime="">` element
- [ ] Post page shows tags as pills linking to `/tags/[tag]`
- [ ] Post page has prev/next links at bottom (chronological order)
- [ ] Post page has "← Back to list" link at bottom
- [ ] First post has no "Previous" link; last post has no "Next" link
