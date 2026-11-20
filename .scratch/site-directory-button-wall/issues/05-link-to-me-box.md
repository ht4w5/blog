# 05: Link-to-me box with copyable embed snippet

**What to build:** At the top of the button wall, another webmaster sees this site's own 88×31 button beside a ready-made HTML embed snippet rendered in the blog's markdown code-block style, with absolute URLs so it works from any site. One click on Copy puts the snippet on the clipboard with clear "copied!" feedback; where the clipboard API is unavailable, the snippet text is selected for manual copying.

**Blocked by:** 04 — Button wall on the homepage with placeholder buttons

**Status:** ready-for-agent

- [ ] The link-to-me box leads the button section, showing the site's own button beside the snippet in code-block style
- [ ] The snippet is the raw anchor-wrapping-image HTML with absolute URLs to the site root and the button asset
- [ ] The Copy button copies the snippet and shows "copied!" feedback
- [ ] Without clipboard access, the snippet text becomes selected instead
- [ ] Built-HTML tests cover the box's presence and the snippet's content
