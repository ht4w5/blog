# 01: Rename accent tokens to the accent vocabulary

**What to build:** The site's accent design tokens speak the same language as the design: the two theme tokens and every consumer — body links, hover states, footnote links and **backrefs**, theme-toggle hover, **site directory** links — use accent-oriented names (`--color-accent`, `--color-accent-hover`) instead of link-oriented ones. Not user-visible: the rendered site is pixel-identical. The deliverable is a clean refactor that aligns code with the project's design vocabulary and makes the palette change a reviewable visual-only diff.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] The two accent tokens carry accent-oriented names at their definitions and at every consumer, with no stale references to the old names
- [x] No color value changes anywhere: rendered pages are visually identical to before (zero-diff refactor)
- [x] The built-HTML and browser test suites stay green

## Comments

- Resolved on `integration/teal-accent` (`a51dc7b`, merged `fb69a63`): `--color-link`/`--color-link-hover` renamed to `--color-accent`/`--color-accent-hover` at all definitions and every consumer in `src/styles/global.css`; zero color-value changes. Code-review fix-up `1c6a81a` (merged `d5bc01f`) additionally updated a stale "link color" phrase in a comment to the accent vocabulary.
- Checkbox caveat: the suites are green except one pre-existing baseline failure — `tests/html/footer.test.mjs` "the CC badge stays in the footer" — introduced by maintainer commit `4958778 data: add buttons` and verified failing identically on `main`. Unrelated to this rename; results before/after the rename are identical.
