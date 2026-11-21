# 01: Mobile site-nav rows

**What to build:** At phone widths (≤480px — the arrangement's natural failure point is ≈470px) the **site nav** stacks into three deliberate rows: the site title and the theme toggle on the first row, the bracket nav links on the second (wrappable, so nothing overflows even on the narrowest phones), and the search field spanning the full content width on the third. Wider screens keep the one-line desktop nav, visually unchanged. Includes the prefactor that makes the arrangement expressible: the theme toggle becomes a direct child of the nav container instead of being nested in the search wrapper; the desktop flex order keeps search and toggle together at the right.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] At 375×812 and any width ≤480px, the site nav shows row 1: site title left, theme toggle right; row 2: all bracket nav links; row 3: search spanning the full content width.
- [x] The bracket nav links wrap instead of overflowing at widths below ≈376px.
- [x] The theme toggle works from its first-row position (cycles system → dark → light, state persists).
- [x] Search works from its full-width row; the results dropdown appears directly under it.
- [x] At desktop width the site nav is on one line and visually unchanged.
- [x] Browser tests cover the mobile row arrangement and a desktop one-line guard; `pnpm test` passes.

## Answer

Implemented on `integration/mobile-nav-toc` (feature commit `1c00424`, merged `42b8b56`; code-review fixes `acce2c4`). The theme toggle is a direct child of the nav container; ≤480px the nav is a three-row CSS grid (title+toggle / wrappable links / full-width search with results directly under it); desktop preserved byte-identical via a gap-compensating margin on the toggle. Browser tests in `tests/browser/site-nav.spec.ts`: row arrangement at 320/375/460 wide, link wrapping, toggle cycle+persistence, search from the full-width row, desktop one-line guard. `pnpm test` green modulo the pre-existing accepted red (`tests/html/footer.test.mjs` CC badge — maintainer decision in `.scratch/teal-accent/spec.md`).

## Comments

- Measured during implementation: the one-line nav actually fits down to ≈616px viewport, not ≈470px as the spec's failure-point note assumed. In the intermediate band ≈528–615px (where the nav wraps raggedly both before and after this change) the mandated prefactor changes today's wrap grouping: the toggle now wraps alone to the left instead of wrapping together with search. Pure flexbox cannot bind two items across a wrap; fixing it would need a new breakpoint or a container `nowrap` policy, both spec-level decisions ("breakpoints deliberately not unified", "widths that aren't broken stay as they are"). Left as-is — flagged for maintainer.
