# Spec: Accent color switch to teal (#2aa198)

**Status:** resolved

## Problem Statement

The blog's only brand color — the link blue used across every page — is a generic default-looking blue. The maintainer has chosen a teal identity (`#2aa198`) and wants it applied consistently across the site. Two hazards make this more than a find-and-replace: the chosen teal is too light to read on the site's near-white background (3.03:1 contrast, below the WCAG AA threshold for body text), and "accent color" is not a defined concept anywhere in the project, so nothing stops a future change from drifting the palette apart again.

## Solution

Switch the site's **accent color** to the teal hue of `#2aa198`, with theme-aware lightness: dark mode uses `#2aa198` exactly (5.51:1 on the dark background), while light mode uses a darkened sibling `#1f8079` (4.55:1 on the near-white background) so every link stays comfortably readable in both themes. Hover states darken in light mode and lighten in dark mode, keeping today's feedback direction. The accent is captured as named design tokens, renamed from link-oriented names to accent-oriented ones so the code speaks the same language as the design, and "accent color" is added to the project glossary so future design talk has one unambiguous term. Everything not accent-colored — text, backgrounds, borders, code styling, tag pill colors — is untouched.

## User Stories

1. As a reader, I want links rendered in the blog's teal accent, so that the site has a distinctive visual identity instead of a default-looking blue.
2. As a reader in light mode, I want link text dark enough against the near-white background, so that I can read links without straining.
3. As a reader in dark mode, I want link text bright enough against the dark background, so that links are clearly legible at night.
4. As a low-vision reader, I want link text to meet WCAG AA contrast (4.5:1) in both themes, so that I can read the site without extra tooling or zooming.
5. As a reader, I want hovered links to shift noticeably darker in light mode, so that I get clear feedback that the element is interactive.
6. As a reader, I want hovered links to shift noticeably lighter in dark mode, so that hover feedback works on a dark background too.
7. As a reader whose system preference is dark, I want the dark accent applied automatically, so that theme switching feels seamless.
8. As a reader who explicitly forced light or dark via the theme toggle, I want the accent shade matching my chosen theme, so that my choice is respected in every visual detail.
9. As a reader, I want the theme toggle's hover state to use the accent, so that all interactive affordances share one visual language.
10. As a reader, I want footnote **backrefs** and footnote links to use the accent, so that footnote navigation feels like part of the same design as ordinary links.
11. As a reader, I want links on every page — home, posts, tag pages, the **site directory**, tag listings, 404 — to show the new accent, so that nothing looks half-migrated.
12. As a reader, I want body text, headings, borders, muted text, and code styling to look exactly as before, so that only the accent shifts and nothing distracts from reading.
13. As a reader, I want tag pills to keep their distinct per-tag colors, so that I can still tell tags apart at a glance.
14. As a maintainer, I want the accent defined once as named design tokens per theme, so that future color work has a single source of truth.
15. As a maintainer, I want the tokens named after the accent concept rather than after links, so that the vocabulary matches how the design is discussed.
16. As a maintainer, I want both dark-mode mechanisms (system preference and explicit toggle) to carry identical accent values, so that the two paths can never diverge.
17. As a future contributor, I want a one-line rationale beside the token definitions explaining why the accent hex differs per theme, so that nobody "simplifies" it into one value and silently breaks contrast.
18. As a future contributor, I want "accent color" defined in the project glossary, so that design discussions use one unambiguous term for the concept.
19. As a maintainer, I want the change verified in both themes before shipping, so that neither theme ships an unreadable link color.
20. As a maintainer, I want the existing test suite to stay green, so that the token rename provably broke nothing.

## Implementation Decisions

- The accent is a single hue (teal, ~175.6°) with theme-aware lightness. Verified values:
  - Light theme: accent `#1f8079` (4.55:1 on the light background), hover `#175f5a` (7.13:1)
  - Dark theme: accent `#2aa198` (5.51:1 on the dark background), hover `#35b8ad` (7.14:1)
  - `#2aa198` is the identity color of the scheme; the light-theme value is a darkened sibling of the same hue, chosen purely to hold WCAG AA on the near-white background.
- The two accent tokens are renamed from link-oriented names to `--color-accent` and `--color-accent-hover`. All consumers (body links, theme-toggle hover, footer links, footnote links and **backrefs**, **site directory** links) already read the tokens, so the rename is mechanical and introduces no visual change beyond the palette swap itself.
- The accent tokens live in the global stylesheet's theme-token blocks, which are the only color literals in the codebase. Both dark-mode mechanisms — system preference and the explicit `data-theme` toggle — define the same token values and must be kept in sync.
- A one-line comment at the token definitions records the rationale: fixed accent hue, lightness varies per theme to keep WCAG AA contrast on each background.
- The project glossary gains an "Accent color" entry (implementation-free, per glossary rules) defining it as the single brand color used for links and interactive affordances, with avoided synonyms such as "link color" and "brand color".
- Theme-toggle behavior and the `data-theme` mechanism are unchanged; only the values behind the tokens change.

## Testing Decisions

- A good test asserts external behavior — rendered HTML or observable interaction — never CSS property values. This is the repo's established testing rule (documented when the two test seams were created).
- This change has zero external-behavior deltas: no new automated tests at either seam. A computed-style color assertion would sit exactly where the house rule forbids testing, and is considered and rejected.
- Both existing seams run as smoke coverage: the built-HTML tests and the browser tests must stay green, proving the token rename broke no markup or interaction.
- Manual verification happens at the highest seam — the browser seam (the real rendered site): eyeball link color, hover feedback, and the theme toggle in both themes before shipping.
- Prior art: the built-HTML suite and the browser suite (homepage and search-interaction specs) show how both seams are exercised; nothing here extends them.

## Out of Scope

- Tag pill colors: the per-tag hashed hues are content-derived identity, not brand color, and stay as they are.
- Syntax highlighting colors in code blocks.
- Image assets (GitHub icon, license badge, **buttons** and **flair badges**): their colors are third-party art.
- The neutral palette — backgrounds, body text, borders, code backgrounds: this is a one-off accent swap, not an adoption of a larger palette system (e.g. Solarized).
- Selection highlight and focus-ring colors, which are currently unstyled browser defaults.
- Any token rename beyond the two accent tokens.
- New automated tests and an ADR (the change is trivially reversible; the durable rationale lives in the token comment and the glossary).

## Further Notes

- Contrast figures above were computed for each value against its own theme background; all four exceed 4.5:1 except the intentionally-not-used light-mode rendering of `#2aa198` itself (3.03:1), which is why light mode gets the darkened sibling.
- A sweep confirmed the superseded blue (`#3366aa` / `#224488`) appears only at the token definitions in the global stylesheet — no stray copies elsewhere in source, components, or tests.
- The rename keeps this change honest for future theming work: "accent" now names the concept in code, in the glossary, and in review discussion alike.

## Comments

- Implemented on `integration/teal-accent`; tickets 01–03 all resolved. Two-axis code review (Standards + Spec) run against `main`; the one actionable finding (stale "link color" comment phrase) fixed in `1c6a81a` (merged `d5bc01f`).
- Documented suppressions: glossary definitional use of an avoided synonym kept (spec-mandated wording; **Backref** entry precedent); dark token-block duplication kept (this spec mandates both dark mechanisms define identical values; merging the blocks is out of scope); button-wall hover outline follows the accent (it consumed the old token, so the mechanical rename covers it); the `tests/html/footer.test.mjs` "CC badge" failure is pre-existing (from maintainer commit `4958778 data: add buttons`, fails identically on `main`) and left to the maintainer — it needs a policy decision: keep the CC wall button and re-scope the guarded test, or drop the button from the wall data.
- Both themes verified in the real rendered site (browser seam) before shipping, per Testing Decisions.
