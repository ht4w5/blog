# 01: Mobile site-nav rows

**What to build:** At phone widths (≤480px — the arrangement's natural failure point is ≈470px) the **site nav** stacks into three deliberate rows: the site title and the theme toggle on the first row, the bracket nav links on the second (wrappable, so nothing overflows even on the narrowest phones), and the search field spanning the full content width on the third. Wider screens keep the one-line desktop nav, visually unchanged. Includes the prefactor that makes the arrangement expressible: the theme toggle becomes a direct child of the nav container instead of being nested in the search wrapper; the desktop flex order keeps search and toggle together at the right.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] At 375×812 and any width ≤480px, the site nav shows row 1: site title left, theme toggle right; row 2: all bracket nav links; row 3: search spanning the full content width.
- [ ] The bracket nav links wrap instead of overflowing at widths below ≈376px.
- [ ] The theme toggle works from its first-row position (cycles system → dark → light, state persists).
- [ ] Search works from its full-width row; the results dropdown appears directly under it.
- [ ] At desktop width the site nav is on one line and visually unchanged.
- [ ] Browser tests cover the mobile row arrangement and a desktop one-line guard; `pnpm test` passes.
