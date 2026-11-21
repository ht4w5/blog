# 02: Table of contents — readable and always expanded

**What to build:** On post pages the **table of contents** becomes legible and never folded. Entry text is enlarged to 14px mono and the Contents label to body size (16px) and bold. The disclosure is removed outright: the label is a plain static heading and the entries are always visible on load in both placements — the sticky right rail on wide screens, the copy above the article on narrow screens. Current-section marking and jumping are unchanged, and exactly one table of contents is exposed to assistive tech at a time.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] The table-of-contents entries render at 14px mono and the Contents label at 16px bold.
- [x] At 375×812 on a post page, the table of contents above the article shows its entries fully expanded on load — nothing to tap open.
- [x] The Contents label is plain static text — not interactive (no toggle behaviour, no pointer cursor, no disclosure marker).
- [x] Tapping an entry navigates to its section; the current section's entry carries `aria-current`, updating on scroll and after a jump.
- [x] Exactly one table of contents is exposed to assistive tech at a time.
- [x] At desktop width the sticky right rail is unchanged apart from the larger text and static label; entries visible on load.
- [x] The glossary's "Table of contents" entry is updated to match (no folding).
- [x] Browser tests cover the always-expanded state, the static label, the sizing, and the `aria-current` tracking; `pnpm test` passes.

## Answer

Implemented on `integration/nav-posts-search` (feature commit `93d6564`, merged `d15ca8e`; code-review fixes `b1844d1`). The `<details>/<summary>` disclosure is gone from `TableOfContents.astro`: both variants render a static Contents heading and always-visible entries; the scrollspy's disclosure hooks are stripped while per-instance scrollspy, `aria-current` marking, jumps, and the rail's layout/stickiness are unchanged. Entries 0.875rem (14px) mono, label 1rem (16px) bold. The GLOSSARY "Table of contents" entry is updated (no folding). Disclosure-pinning tests in `tests/browser/table-of-contents.spec.ts` were replaced (always-expanded, static label, sizing, `aria-current` tracking); built-HTML guard in `tests/html/table-of-contents.test.mjs`. `pnpm test` green modulo the pre-existing accepted red (`tests/html/footer.test.mjs` CC badge — maintainer decision in `.scratch/teal-accent/spec.md`).

## Comments

- Sizing is pinned visitor-observably via line-box heights (label ≈ 16px×1.8, entries ≈ 14px×1.8 at the component's line spacing). The mono face and bold weight have no geometry at the browser seam and are deliberately not asserted; the test name was reworded in the code-review fix pass to claim only what the seam observes.
- The Contents label keeps the component's mono face — the ticket's "body size" read as size-only; the rail is otherwise unchanged per the ticket.
- The code-review fix pass also reworded the glossary definition to drop "outline" and "sidebar" (both on the entry's own _Avoid_ list; `docs/agents/domain.md` bars avoided terms).
