# 04: Site nav — bracket bar rework, search widget removed

**What to build:** The **site nav** becomes a tidy bracket bar. The links are `[home]`, `[posts]` (now pointing at the posts page), `[about]`, `[tags]`, `[dirs]`, `[feed]`, with the theme toggle as the final bracket item — its bracket-style label showing the current mode (`[system]`/`[dark]`/`[light]`) and updating as the unchanged system→dark→light cycle advances, and its accessible name saying it changes the theme. On desktop the nav stays one line: site title left, the whole bracket group right. On phones (≤480px) it stacks into two deliberate rows — site title, then the wrappable bracket links. The embedded search widget (input, results dropdown, script, expand-on-focus behaviour) is removed entirely.

**Blocked by:** 01: Posts page with fuzzy filter (the `[posts]` link retargets to `/posts`, which must exist)

**Status:** resolved

- [x] The nav links, in order, are `[home]` → `/`, `[posts]` → `/posts`, `[about]`, `[tags]`, `[dirs]`, `[feed]`, then the theme toggle; the site title still links home.
- [x] The theme toggle works from its bracket position: clicking cycles system → dark → light, state persists, and its label reflects the current mode after every change; its accessible name says it changes the theme.
- [x] At desktop width the site nav is on one line: title left, bracket group (including the toggle) right.
- [x] At 375×812 and any width ≤480px the nav shows row 1: site title; row 2: all bracket links — asserted at several widths — and the links wrap rather than overflow on the narrowest phones (e.g. 300px).
- [x] No search input or results dropdown is present in the nav at any viewport.
- [x] The glossary's "Site nav" entry is updated to match (no search cluster).
- [x] Browser tests cover the link set and destinations, the toggle's label-mirrors-mode cycle, the desktop one-line arrangement, and the mobile two-row arrangement; the removed search spec is deleted; `pnpm test` passes.

## Answer

Implemented on `integration/nav-posts-search` (feature commit `6db4f34`, merged `b4804fc`; code-review fixes `b1844d1`). The site nav is a bracket bar: `[home]` → `/`, `[posts]` → `/posts`, `[about]`, `[tags]`, `[dirs]`, `[feed]`, then the theme toggle as the final bracket item — still a button with the unchanged system→dark→light cycle and persistence, visible `[system]`/`[dark]`/`[light]` label (existing CSS pseudo-element brackets), accessible name `Change theme (currently system|dark|light)`. Desktop stays one line: title left, bracket group right (right-anchor moved onto `.nav-group` after the search wrapper died). ≤480px is a two-row grid — site title, then the wrappable bracket group (toggle included) — no overflow at 300px. The embedded search widget (markup, script, styles, expand-on-focus) is removed outright; `/search-index.json` and fuse.js are kept for the posts page. `tests/browser/search-click.spec.ts` deleted; `tests/browser/site-nav.spec.ts` reworked (link set/destinations/order, toggle cycle + label-mirrors-mode + accessible name, desktop one-line arrangement, mobile two-row at 300/320/375/460, wrap-not-overflow, no search UI at any viewport, keyboard reachability/operability). The GLOSSARY "Site nav" entry is updated. `pnpm test` green modulo the pre-existing accepted red (`tests/html/footer.test.mjs` CC badge — maintainer decision in `.scratch/teal-accent/spec.md`).

## Comments

- The accessible-name wording was open; pinned to `Change theme (currently {mode})` so it announces the action (user story 28) and the current mode together.
- The visible bracket glyphs are CSS pseudo-elements and rendered `innerText` excludes them, so the tests assert the mode text and treat the brackets as paint.
- The code-review fix pass added the user-story-26 keyboard test (reading order; Enter on links; Enter/Space on the toggle) and truthed-up CONTEXT.md's stale feature bullets (inline search, 20-post pagination) — the latter goes beyond the spec's glossary-only docs decision and is flagged for maintainer.
