# 03: Homepage — 10 most recent posts

**What to build:** The homepage becomes a quick current snapshot: exactly the 10 most recent posts in the existing post-entry markup, followed by one bracket-style `[all posts]` link to the posts page. The numbered pagination pages are removed — the posts page supersedes them. Tag pages' pagination is untouched.

**Blocked by:** 01: Posts page with fuzzy filter (the `[all posts]` link needs `/posts` to exist)

**Status:** resolved

- [x] The homepage lists at most the 10 most recent posts, newest first, in the existing post-entry markup. (The live content set has fewer than 10 posts, so the cap is verified with fixture posts generated during the test run; assertions stay visitor-observable.)
- [x] A bracket-style `[all posts]` link follows the list and navigates to `/posts`.
- [x] The numbered pagination route is gone: a request for a page-2 URL returns the site's 404 page.
- [x] Tag pages still paginate exactly as before.
- [x] Browser tests cover the homepage list, the cap (via fixtures), and the `[all posts]` link; built-HTML tests no longer reference the removed pagination block; `pnpm test` passes.

## Answer

Implemented on `integration/nav-posts-search` (feature commit `7529d49`, merged `40b60db`; code-review fixes `b1844d1`). The homepage renders exactly the 10 most recent posts in the existing post-entry markup followed by one bracket-style `[all posts]` link to `/posts`; `src/pages/page/[page].astro` is deleted; tag pages' pagination is untouched. The 10-cap and the route removal are verified with fixture posts generated during the test run (`tests/browser/fixture-site.ts`: 24 fixture posts, a second build into `dist-fixture/` via the `ASTRO_OUT_DIR` knob in `astro.config.mjs`, served by `tests/static-server.ts`, cleaned up even on failure) asserting the cap, `[all posts]` → the complete `/posts` list, `/page/2` → the 404 page, and tag page 2 for a >20-post tag. Standard-build guards in `tests/browser/homepage-recent.spec.ts` (1280×800 per spec) plus built-HTML tests `tests/html/homepage-recent.test.mjs` and `tests/html/pagination-removed.test.mjs`; `tests/html/button-wall.test.mjs`'s pagination references dropped. `pnpm test` green modulo the pre-existing accepted red (`tests/html/footer.test.mjs` CC badge — maintainer decision in `.scratch/teal-accent/spec.md`).

## Comments

- The fixture mechanism (env-configurable outDir + in-test static server) is test enablement for this ticket's fixture clause — the spec's "no new seams" holds: it is the browser seam against a real fixture-built site.
- Pre-existing bug found, out of scope and untouched: when a tag holds >20 posts, `src/pages/tags/[tag].astro`'s `getStaticPaths` also emits the additional-page entries and collides on the first-page route, so `/tags/<tag>` renders page-2 content. Invisible on the live site (no tag has >20 posts); worth a follow-up ticket.
- The `/page/2` → 404 guard exists both as a static regression test on the standard build and as a fixture-build check with a >20-post content set.
