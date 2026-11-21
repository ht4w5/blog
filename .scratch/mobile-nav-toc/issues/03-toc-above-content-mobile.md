# 03: Table of contents above the content on mobile

**What to build:** On post pages at ≤900px (the existing post-layout breakpoint) the **table of contents** renders as a collapsed Contents disclosure directly under the post title, date, and tags — above the article body — so a mobile reader sees the post's structure before reading: one tap expands it, entries jump to sections, and it collapses out of the way again. Wide screens keep the sticky right rail, expanded by default. Delivered by rendering the table-of-contents component in its rail and inline variants on each post page, each shown at its breakpoint and hidden otherwise (the hidden copy is display-none, hence out of the accessibility tree). A lean comment near the render records why the duplication exists: DOM order equals visual order, the fix works without JavaScript, no node-moving or resize handling. This is the ticket that fixes the headline bug end-to-end.

**Blocked by:** 02: Table of contents — real Contents toggle and current-section marking

**Status:** ready-for-agent

- [ ] At 375×812 on a post page, the table of contents appears directly under the post title/date/tags and above the article body.
- [ ] It is collapsed by default; one tap expands it; a second tap collapses it.
- [ ] Tapping an entry navigates to its section; the current section is marked with `aria-current` in the visible copy.
- [ ] With JavaScript disabled, the disclosure and its entries are present and usable.
- [ ] Exactly one table of contents is exposed to assistive tech at a time (no duplicate navigation regions).
- [ ] At desktop width the sticky right rail is unchanged and expanded by default.
- [ ] A lean comment explains the duplication rationale.
- [ ] Browser tests cover mobile placement-before-content, collapsed default, expansion, and section jumps, plus a desktop rail guard; `pnpm test` passes.
