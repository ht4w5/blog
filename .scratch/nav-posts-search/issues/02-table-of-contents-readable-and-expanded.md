# 02: Table of contents — readable and always expanded

**What to build:** On post pages the **table of contents** becomes legible and never folded. Entry text is enlarged to 14px mono and the Contents label to body size (16px) and bold. The disclosure is removed outright: the label is a plain static heading and the entries are always visible on load in both placements — the sticky right rail on wide screens, the copy above the article on narrow screens. Current-section marking and jumping are unchanged, and exactly one table of contents is exposed to assistive tech at a time.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The table-of-contents entries render at 14px mono and the Contents label at 16px bold.
- [ ] At 375×812 on a post page, the table of contents above the article shows its entries fully expanded on load — nothing to tap open.
- [ ] The Contents label is plain static text — not interactive (no toggle behaviour, no pointer cursor, no disclosure marker).
- [ ] Tapping an entry navigates to its section; the current section's entry carries `aria-current`, updating on scroll and after a jump.
- [ ] Exactly one table of contents is exposed to assistive tech at a time.
- [ ] At desktop width the sticky right rail is unchanged apart from the larger text and static label; entries visible on load.
- [ ] The glossary's "Table of contents" entry is updated to match (no folding).
- [ ] Browser tests cover the always-expanded state, the static label, the sizing, and the `aria-current` tracking; `pnpm test` passes.
