# Spec: Site directory page, homepage button wall, and search-result click fix

**Status:** resolved

## Problem Statement

Three problems on the blog, from a reader's and maintainer's perspective:

1. The blog is published at the root of a GitHub Pages domain, and other pages are published under paths of that same domain — but there is no way to discover them. Readers never see what else is available, and the maintainer has no place to list them.
2. The small badge strip sits in the footer of every page. It clutters every page's footer, its badges are normalized to an arbitrary height instead of the classic 88×31 pixel web-button format, and there is no "link to me" snippet for other webmasters who want to link back.
3. Search results are unreliable to click: clicking the left half of a result row collapses the search bar instead of opening the post. Only clicks on the right half work.

## Solution

1. A **site directory**: a manually maintained page listing every **directory entry** (destination published under the domain), reachable from a new `[paths]` header-nav item. Adding an entry is data-only.
2. A **button wall** on the homepage: the footer badges move to a dedicated `buttons` section rendered as classic **88×31 buttons** (with **flair badges** for non-linked decorations), including a "link to me" box that shows the site's own button alongside a copy-pasteable HTML snippet in the blog's code-block style. The footer keeps only the copyright line. Placeholder art is shipped at the final asset paths for the maintainer to overwrite.
3. The search dropdown is stabilized so it cannot slide under the cursor mid-click: clicking anywhere on a result row — left half included — opens the post.

## User Stories

1. As a reader, I want a page listing all destinations published under this domain, so that I can discover the other pages available.
2. As a reader, I want each directory entry to show a short description, so that I know what awaits before clicking.
3. As a reader, I want directory entries shown in a deliberate order, so that the most interesting destinations come first.
4. As a reader, I want off-domain directory entries to open in a new tab with safe link attributes, so that I don't lose my place on the blog.
5. As a reader, I want a `[paths]` item in the header nav on every page, so that I can reach the site directory from anywhere.
6. As a reader, I want the site directory to look like part of the blog, so that it doesn't feel bolted on.
7. As a maintainer, I want the site directory driven by a typed data file, so that adding or reordering entries requires no markup edits.
8. As a maintainer, I want entries to accept both root-relative and absolute destinations, so that I can list same-domain project pages and external destinations alike.
9. As a reader, I want a button wall on the homepage, so that I can see and explore the sites and tools the author links to.
10. As a reader, I want every button to render at exactly 88×31 pixels, so that the wall is a neat grid with no layout shift while images load.
11. As a reader, I want pixel art rendered crisply on high-DPI screens, so that buttons don't look blurred.
12. As a reader, I want buttons packed densely and wrapping on narrow viewports, so that the wall looks right on desktop and mobile.
13. As a reader, I want a subtle hover effect on linked buttons, so that I can tell what is clickable.
14. As a reader, I want flair badges to have no pointer cursor or click affordance, so that I don't try to click dead images.
15. As a reader, I want animated GIF buttons to animate natively, so that classic button art displays as intended.
16. As a reader, I want hover tooltips on buttons that have titles, so that I get extra context.
17. As a reader, I want external button links to open safely, so that browsing the wall can't affect my current page.
18. As a reader, I want every button image to have descriptive alt text, so that screen-reader users know what each button is.
19. As another webmaster, I want a ready-made HTML snippet for this site's button, so that I can link back by copy-pasting.
20. As another webmaster, I want the snippet to use absolute URLs, so that it works from any site.
21. As another webmaster, I want a one-click Copy button with clear "copied!" feedback, so that I know the snippet is on my clipboard.
22. As another webmaster without clipboard access, I want the snippet text selectable as a fallback, so that I can still copy it manually.
23. As another webmaster, I want the snippet shown in the blog's code-block style, so that it is readable and feels native to the site.
24. As a reader, I want the old footer badges to live on the homepage button wall instead, so that footers on every page stay clean.
25. As a reader, I want the footer to show only the copyright line, so that pages end quietly.
26. As a maintainer, I want the four existing badges migrated with their destinations preserved, so that no existing links break.
27. As a maintainer, I want solid-colour placeholder images at the final asset paths, so that I can drop in real art without touching code.
28. As a reader, I want clicking anywhere on a search result row — including the left half — to open the post, so that search reliably navigates.
29. As a reader, I want the search dropdown to stay put while I click, so that my click lands where I aimed.
30. As a mobile reader, I want tapping a search result to open the post, so that search works on touch.
31. As a reader, I want search open/close behaviour to be otherwise unchanged, so that my existing muscle memory still works.
32. As a maintainer, I want automated regression coverage for the rendered pages and the search click behaviour, so that future changes can't silently break them.

## Implementation Decisions

- A new typed data module holds **directory entries**: an `href` field accepting root-relative paths or absolute URLs, a `label` field, and an optional one-line `description`. Order in the data file is the display order; no sort field.
- A new site-directory page at the `/paths` route renders those entries (label as the link, description as a muted line) under a short title and 1–2 sentence intro, in the blog's existing visual style. Absolute-URL entries open in a new tab with `rel="noopener noreferrer"`.
- The header nav gains a `[paths]` item placed after `[tags]` and before `[feed]`, in the existing bracket style.
- A new typed data module holds **buttons**: `id`, required descriptive `alt`, `imageSrc` (site path or external URL), optional `href`, optional `title` tooltip. An entry without `href` is a **flair badge**; with one it is a linked **button**. Flat list for now — no category field.
- A new button-wall component renders the wall as a dense wrapping flex layout (small constant gap) and enforces exact 88×31 dimensions on every image via width/height attributes plus CSS, with `image-rendering: pixelated` and a `crisp-edges` fallback.
- Buttons use plain image tags with no framework image optimization, so animated GIFs keep their animation. Linked buttons get a subtle hover (small lift and/or crisp border highlight); flair badges get no pointer cursor or hover affordance.
- The "link to me" box leads the button section: the site's own 88×31 button beside a snippet rendered in the blog's markdown code-block style. The snippet is the raw HTML anchor-wrapping-image form with absolute URLs to the site root and the button asset. A Copy button gives inline "copied!" feedback; if the clipboard API is unavailable the snippet text is selected instead.
- The button wall renders on the homepage only, as the last section of the main content (after the post list and pagination), under the heading `buttons`. It does not appear on pagination pages or any other page.
- The footer badge component is retired: the footer keeps only the copyright line, and the badge-specific footer CSS (including its height variable) is removed.
- The four existing badges become wall entries with destinations preserved: the self-referential button (links to the site root and doubles as the "link to me" art), the CC BY-NC-SA licence button, the xjtumen button, and the GitHub button.
- Placeholder art: solid-colour 88×31 PNGs are generated at the exact final asset filenames under the buttons asset directory, so replacing art is a plain file drop-in.
- Search-result click fix: the dropdown gets a fixed width anchored to its container's right edge so it cannot shift horizontally while a click is in flight; each result row remains a single full-width anchor (title and date inside it) so the whole row is one hit target; navigation stays same-tab; all open/close behaviour is unchanged. Root cause being fixed: on mousedown the input blurs and its width transition shrinks the right-anchored container from the left, sliding the absolutely-positioned dropdown out from under the cursor before mouseup fires.
- Test infrastructure is added from scratch: a lightweight Node test runner asserting on built-site HTML, plus a single Playwright test for the search interaction run against the preview server.

## Testing Decisions

- Good tests assert only external behaviour: the HTML a visitor receives from the built site, and observable click outcomes in a real browser. Tests must not assert on CSS property values, markup structure details, or script internals.
- The built-HTML seam covers: the site directory rendering entries in file order with safe external-link attributes; the homepage wall rendering buttons/flair badges at 88×31 with required alt text; the link-to-me box with code-block-styled snippet and Copy control; the wall's absence on all non-homepage pages; the footer reduced to the copyright line; the `[paths]` nav item.
- The browser seam covers exactly one thing: a mousedown+mouseup+click sequence on the left half of a search result row navigates to the post instead of merely collapsing the search bar.
- Prior art: none — this repo has no tests today. Keep the new infrastructure minimal (Node's built-in test runner for HTML assertions, one Playwright spec for the click bug).

## Out of Scope

- Real button artwork — placeholders only; the maintainer supplies final art as file drop-ins.
- Categories or grouping on the button wall (added later if the wall outgrows one or two rows).
- Automatic discovery of published domain paths — the site directory stays manually maintained.
- Any change to search ranking, matching, or general UX beyond the click fix.
- Theme, typography, or layout changes outside the new/changed sections.
- A standalone buttons page — the wall is a homepage section per the agreed design.

## Further Notes

- Terminology follows the project glossary: *site directory*, *directory entry*, *button wall*, *button*, *flair badge*. The avoided synonyms ("paths page", "links page", "sitemap", "badge", "chip") should not appear in code comments or UI copy.
- No ADR is warranted: every decision here is easily reversible and unsurprising with this spec as context.
- The spec was converged with the maintainer through a design interview; the 88×31 visual treatment (exact dimensions, crisp pixel rendering, dense packing, hover polish, GIF support) is intentional retro web-button style, not an oversight.

## Comments

- Migrated from GitHub issue ht4w5/blog#1 when the issue tracker moved to local markdown.

- Implemented on `integration/site-directory-button-wall`; tickets 01–06 all resolved. Two-axis code review (Standards + Spec) run against `main`; findings fixed in `4ac1eda`. Four documented suppressions: spec-mandated `id` field kept despite being unused (Speculative Generality), stylesheet split skipped (Out of Scope), the `under-construction` flair entry kept (ticket 04 requires flair rendering to be test-covered), flair pointer-cursor left untested (CSS-property assertions are barred by the repo's test rules).
