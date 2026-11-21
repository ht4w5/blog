# 02: Table of contents — real Contents toggle and current-section marking

**What to build:** The **table of contents**' Contents label becomes a genuine disclosure toggle on every viewport — it loads expanded, and clicking, tapping, or pressing Enter/Space on it collapses and re-expands the list — ending the current dead affordance (a pointer cursor promising a click that does nothing). At the same time, the table of contents marks the entry for the section currently being read with `aria-current`, updating as the reader scrolls or jumps. The scrollspy becomes driven per table-of-contents instance rather than assuming a single one — the prefactor that lets a second copy land cleanly in ticket 03. (Until ticket 03, the mobile table of contents still sits at the bottom of the page; this ticket is the toggle and tracking groundwork.)

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Clicking or tapping the Contents label collapses the list; a second activation re-expands it — on any viewport.
- [x] The disclosure is keyboard-operable (Enter/Space) and loads expanded.
- [x] While reading a post, the table-of-contents entry for the current section carries `aria-current`, updating on scroll and after jumping to a section.
- [x] Current-section marking does not assume a single table of contents instance (verified by the code being instance-driven and the behaviour tests passing with the component used more than once on a page).
- [x] The right rail's layout, stickiness, and scroll-into-view of the active entry are unchanged at desktop width.
- [x] Browser tests cover the toggle and the `aria-current` tracking; `pnpm test` passes.

## Answer

Implemented on `integration/mobile-nav-toc` (feature commit `a4f56f9`, merged `57809a5`; code-review fixes `acce2c4`). The Contents label is a native `<details open>`/`<summary>` disclosure (loads expanded; click/tap/Enter/Space toggle; works without JavaScript; default marker hidden cross-browser). Scrollspy is per-instance (`setupScrollspy` per copy, shared scroll/resize fan-out), active entry marked `aria-current`. Browser tests in `tests/browser/table-of-contents.spec.ts`, including a multi-instance test. `pnpm test` green modulo the pre-existing accepted red (`tests/html/footer.test.mjs` CC badge — maintainer decision in `.scratch/teal-accent/spec.md`).

## Comments

- Multi-instance verification evolved across tickets: at this ticket's landing the site rendered one table of contents, so the multi-instance test doubled the rendered copy via `page.route`; after ticket 03 landed (and in the code-review fix pass) the test was reconciled to exercise the two real copies' state independence instead. The code itself has been instance-driven since `a4f56f9`.
- The phone tests assert state-relative disclosure flips rather than "loads expanded", because ticket 03's inline variant intentionally loads collapsed; "loads expanded" is asserted at desktop where the rail is visible.
