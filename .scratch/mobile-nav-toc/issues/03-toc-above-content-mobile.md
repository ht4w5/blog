# 03: Table of contents above the content on mobile

**What to build:** On post pages at ≤900px (the existing post-layout breakpoint) the **table of contents** renders as a collapsed Contents disclosure directly under the post title, date, and tags — above the article body — so a mobile reader sees the post's structure before reading: one tap expands it, entries jump to sections, and it collapses out of the way again. Wide screens keep the sticky right rail, expanded by default. Delivered by rendering the table-of-contents component in its rail and inline variants on each post page, each shown at its breakpoint and hidden otherwise (the hidden copy is display-none, hence out of the accessibility tree). A lean comment near the render records why the duplication exists: DOM order equals visual order, the fix works without JavaScript, no node-moving or resize handling. This is the ticket that fixes the headline bug end-to-end.

**Blocked by:** 02: Table of contents — real Contents toggle and current-section marking

**Status:** resolved

- [x] At 375×812 on a post page, the table of contents appears directly under the post title/date/tags and above the article body.
- [x] It is collapsed by default; one tap expands it; a second tap collapses it.
- [x] Tapping an entry navigates to its section; the current section is marked with `aria-current` in the visible copy.
- [x] With JavaScript disabled, the disclosure and its entries are present and usable.
- [x] Exactly one table of contents is exposed to assistive tech at a time (no duplicate navigation regions).
- [x] At desktop width the sticky right rail is unchanged and expanded by default.
- [x] A lean comment explains the duplication rationale.
- [x] Browser tests cover mobile placement-before-content, collapsed default, expansion, and section jumps, plus a desktop rail guard; `pnpm test` passes.

## Answer

Implemented on `integration/mobile-nav-toc` (feature commit `8344e76`, merged `9210b0f`; code-review fixes `acce2c4`). `TableOfContents.astro` gained a `rail`/`inline` variant; each post page renders both, each shown at its breakpoint (≤900px inline, collapsed and placed directly under the post header; >900px the unchanged sticky rail, open by default), the hidden copy display-none hence out of the accessibility tree. Lean comment at the render records the duplication rationale. Browser tests in `tests/browser/table-of-contents.spec.ts` cover placement, collapsed default, tap expand/collapse, section jumps with `aria-current`, no-JS usability, single exposure to assistive tech, and a desktop rail guard. `pnpm test` green modulo the pre-existing accepted red (`tests/html/footer.test.mjs` CC badge — maintainer decision in `.scratch/teal-accent/spec.md`).
