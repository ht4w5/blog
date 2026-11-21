# 01: Rename accent tokens to the accent vocabulary

**What to build:** The site's accent design tokens speak the same language as the design: the two theme tokens and every consumer — body links, hover states, footnote links and **backrefs**, theme-toggle hover, **site directory** links — use accent-oriented names (`--color-accent`, `--color-accent-hover`) instead of link-oriented ones. Not user-visible: the rendered site is pixel-identical. The deliverable is a clean refactor that aligns code with the project's design vocabulary and makes the palette change a reviewable visual-only diff.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The two accent tokens carry accent-oriented names at their definitions and at every consumer, with no stale references to the old names
- [ ] No color value changes anywhere: rendered pages are visually identical to before (zero-diff refactor)
- [ ] The built-HTML and browser test suites stay green

## Comments
