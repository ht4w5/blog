# 04: Site nav — bracket bar rework, search widget removed

**What to build:** The **site nav** becomes a tidy bracket bar. The links are `[home]`, `[posts]` (now pointing at the posts page), `[about]`, `[tags]`, `[dirs]`, `[feed]`, with the theme toggle as the final bracket item — its bracket-style label showing the current mode (`[system]`/`[dark]`/`[light]`) and updating as the unchanged system→dark→light cycle advances, and its accessible name saying it changes the theme. On desktop the nav stays one line: site title left, the whole bracket group right. On phones (≤480px) it stacks into two deliberate rows — site title, then the wrappable bracket links. The embedded search widget (input, results dropdown, script, expand-on-focus behaviour) is removed entirely.

**Blocked by:** 01: Posts page with fuzzy filter (the `[posts]` link retargets to `/posts`, which must exist)

**Status:** ready-for-agent

- [ ] The nav links, in order, are `[home]` → `/`, `[posts]` → `/posts`, `[about]`, `[tags]`, `[dirs]`, `[feed]`, then the theme toggle; the site title still links home.
- [ ] The theme toggle works from its bracket position: clicking cycles system → dark → light, state persists, and its label reflects the current mode after every change; its accessible name says it changes the theme.
- [ ] At desktop width the site nav is on one line: title left, bracket group (including the toggle) right.
- [ ] At 375×812 and any width ≤480px the nav shows row 1: site title; row 2: all bracket links — asserted at several widths — and the links wrap rather than overflow on the narrowest phones (e.g. 300px).
- [ ] No search input or results dropdown is present in the nav at any viewport.
- [ ] The glossary's "Site nav" entry is updated to match (no search cluster).
- [ ] Browser tests cover the link set and destinations, the toggle's label-mirrors-mode cycle, the desktop one-line arrangement, and the mobile two-row arrangement; the removed search spec is deleted; `pnpm test` passes.
