# 03: Homepage — 10 most recent posts

**What to build:** The homepage becomes a quick current snapshot: exactly the 10 most recent posts in the existing post-entry markup, followed by one bracket-style `[all posts]` link to the posts page. The numbered pagination pages are removed — the posts page supersedes them. Tag pages' pagination is untouched.

**Blocked by:** 01: Posts page with fuzzy filter (the `[all posts]` link needs `/posts` to exist)

**Status:** ready-for-agent

- [ ] The homepage lists at most the 10 most recent posts, newest first, in the existing post-entry markup. (The live content set has fewer than 10 posts, so the cap is verified with fixture posts generated during the test run; assertions stay visitor-observable.)
- [ ] A bracket-style `[all posts]` link follows the list and navigates to `/posts`.
- [ ] The numbered pagination route is gone: a request for a page-2 URL returns the site's 404 page.
- [ ] Tag pages still paginate exactly as before.
- [ ] Browser tests cover the homepage list, the cap (via fixtures), and the `[all posts]` link; built-HTML tests no longer reference the removed pagination block; `pnpm test` passes.
