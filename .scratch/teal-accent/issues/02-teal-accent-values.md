# 02: Switch accent values to teal with theme-aware lightness

**What to build:** Links and every accent affordance render in the site's new teal accent on every page — home, posts, tag pages, the **site directory**, 404. Light mode uses `#1f8079` with hover `#175f5a`; dark mode uses `#2aa198` with hover `#35b8ad`, identically under both dark mechanisms (system preference and explicit theme toggle). The hue is fixed; lightness varies per theme so body-text links stay WCAG AA (4.5:1) on each background. Hover darkens in light mode and lightens in dark mode, preserving today's feedback direction. A one-line rationale comment at the token definitions records why the accent hex differs per theme. Demoable: the site is teal and readable in both themes.

**Blocked by:** 01 (Rename accent tokens to the accent vocabulary — same token-definition block; prefactor lands first)

**Status:** ready-for-agent

- [ ] Light theme renders accent `#1f8079` and hover `#175f5a`; dark theme renders accent `#2aa198` and hover `#35b8ad`
- [ ] Both dark mechanisms — system preference and the explicit toggle — show identical accent values
- [ ] All accent consumers show the teal accent: body links, hover states, footnote links and **backrefs**, theme-toggle hover, **site directory** links
- [ ] Each of the four values measures at least 4.5:1 against its own theme background
- [ ] A one-line rationale comment sits at the token definitions (fixed hue, per-theme lightness for AA)
- [ ] Everything non-accent — text, backgrounds, borders, code styling, tag pill colors — is unchanged
- [ ] The built-HTML and browser test suites stay green, and both themes are eyeballed in the browser before shipping

## Comments
