# 02: Switch accent values to teal with theme-aware lightness

**What to build:** Links and every accent affordance render in the site's new teal accent on every page — home, posts, tag pages, the **site directory**, 404. Light mode uses `#1f8079` with hover `#175f5a`; dark mode uses `#2aa198` with hover `#35b8ad`, identically under both dark mechanisms (system preference and explicit theme toggle). The hue is fixed; lightness varies per theme so body-text links stay WCAG AA (4.5:1) on each background. Hover darkens in light mode and lightens in dark mode, preserving today's feedback direction. A one-line rationale comment at the token definitions records why the accent hex differs per theme. Demoable: the site is teal and readable in both themes.

**Blocked by:** 01 (Rename accent tokens to the accent vocabulary — same token-definition block; prefactor lands first)

**Status:** resolved

- [x] Light theme renders accent `#1f8079` and hover `#175f5a`; dark theme renders accent `#2aa198` and hover `#35b8ad`
- [x] Both dark mechanisms — system preference and the explicit toggle — show identical accent values
- [x] All accent consumers show the teal accent: body links, hover states, footnote links and **backrefs**, theme-toggle hover, **site directory** links
- [x] Each of the four values measures at least 4.5:1 against its own theme background
- [x] A one-line rationale comment sits at the token definitions (fixed hue, per-theme lightness for AA)
- [x] Everything non-accent — text, backgrounds, borders, code styling, tag pill colors — is unchanged
- [x] The built-HTML and browser test suites stay green, and both themes are eyeballed in the browser before shipping

## Comments

- Resolved on `integration/teal-accent` (`f382a62`, merged `0a0bba9`): light accent `#1f8079` / hover `#175f5a`; dark accent `#2aa198` / hover `#35b8ad` — identical under both dark mechanisms (system preference and `data-theme` toggle); rationale comment at the token definitions. Contrast re-verified: 4.55:1 / 7.13:1 / 5.51:1 / 7.14:1 against each theme's background.
- Both themes eyeballed in real Chromium (homepage, a footnotes post, `/dirs`): links teal and readable in both, hover darkens in light mode and lightens in dark mode. Forced `data-theme` and `prefers-color-scheme` rendering confirmed pixel-identical.
- Note: some headings (post titles, **site directory** entry labels) render in text color at rest and show the accent on hover — that is the pre-existing design (the consumers read the tokens); this change swapped the palette only, per spec.
- Checkbox caveat: suites green except the pre-existing baseline failure `tests/html/footer.test.mjs` "the CC badge stays in the footer" (from `4958778`, fails identically on `main`) — not a regression from this ticket.
