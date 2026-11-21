# 02: Table of contents — real Contents toggle and current-section marking

**What to build:** The **table of contents**' Contents label becomes a genuine disclosure toggle on every viewport — it loads expanded, and clicking, tapping, or pressing Enter/Space on it collapses and re-expands the list — ending the current dead affordance (a pointer cursor promising a click that does nothing). At the same time, the table of contents marks the entry for the section currently being read with `aria-current`, updating as the reader scrolls or jumps. The scrollspy becomes driven per table-of-contents instance rather than assuming a single one — the prefactor that lets a second copy land cleanly in ticket 03. (Until ticket 03, the mobile table of contents still sits at the bottom of the page; this ticket is the toggle and tracking groundwork.)

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Clicking or tapping the Contents label collapses the list; a second activation re-expands it — on any viewport.
- [ ] The disclosure is keyboard-operable (Enter/Space) and loads expanded.
- [ ] While reading a post, the table-of-contents entry for the current section carries `aria-current`, updating on scroll and after jumping to a section.
- [ ] Current-section marking does not assume a single table of contents instance (verified by the code being instance-driven and the behaviour tests passing with the component used more than once on a page).
- [ ] The right rail's layout, stickiness, and scroll-into-view of the active entry are unchanged at desktop width.
- [ ] Browser tests cover the toggle and the `aria-current` tracking; `pnpm test` passes.
