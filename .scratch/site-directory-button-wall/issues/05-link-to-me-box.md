# 05: Link-to-me box with copyable embed snippet

**What to build:** At the top of the button wall, another webmaster sees this site's own 88×31 button beside a ready-made HTML embed snippet rendered in the blog's markdown code-block style, with absolute URLs so it works from any site. One click on Copy puts the snippet on the clipboard with clear "copied!" feedback; where the clipboard API is unavailable, the snippet text is selected for manual copying.

**Blocked by:** 04 — Button wall on the homepage with placeholder buttons

**Status:** resolved

- [x] The link-to-me box leads the button section, showing the site's own button beside the snippet in code-block style
- [x] The snippet is the raw anchor-wrapping-image HTML with absolute URLs to the site root and the button asset
- [x] The Copy button copies the snippet and shows "copied!" feedback
- [x] Without clipboard access, the snippet text becomes selected instead
- [x] Built-HTML tests cover the box's presence and the snippet's content

## Comments

- Resolved on `integration/site-directory-button-wall` (`1e0a6ec`): link-to-me box leads the button section with the site's own button and the absolute-URL embed snippet in the blog's code-block style; Copy button with "copied!" feedback and a text-selection fallback. Browser tests cover the Copy interaction (justified extension of the browser seam — see `tests/README.md`). Post-review: behavioural assertions + text-based locators (`4ac1eda`).
- Superseded after maintainer review: the link-to-me box was removed again (component, copy control, snippet, and its tests deleted). The self button remains in the wall without the "link to me" tooltip.
