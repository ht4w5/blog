# Spec: Mobile site-nav arrangement and table-of-contents placement

**Status:** ready-for-agent

## Problem Statement

1. On phone-width screens the **site nav** is awkwardly arranged. Its three parts —
   the site title, the bracket nav links, and the search + theme-toggle cluster —
   fall into ragged stacked rows: the title sits alone on the first line, the links
   wrap as one block to the second, and the search cluster is stranded right-aligned
   on the third, leaving dead space and tiny tap targets. The links themselves
   cannot wrap, so on very narrow phones they would overflow.
2. On post pages at narrow widths the **table of contents** ends up at the very
   bottom of the page — below the entire article and the prev/next links, just
   above the footer — because it renders after the article content. A reader on a
   phone never discovers it.

## Solution

1. On phone widths the site nav reflows into three deliberate rows: the site title
   and the theme toggle on the first row, the bracket nav links on the second, and
   the search field spanning the full content width on the third. On wider screens
   the nav stays on one line exactly as it looks today.
2. On narrow screens the table of contents renders above the article content (right
   after the post title, date, and tags) as a collapsed **Contents** disclosure: one
   tap reveals the outline, and its entries jump to sections. Wide screens keep the
   sticky right rail, expanded by default — and its Contents label becomes a real
   collapse toggle while it's at it.

## User Stories

1. As a mobile reader, I want the site nav to stack into deliberate rows, so that it
   reads as a tidy bar instead of a ragged pile.
2. As a mobile reader, I want the site title and the theme toggle on the first row,
   so that the site identity and theme control are immediately visible.
3. As a mobile reader, I want the bracket nav links together on their own row, so
   that I can see every destination at once.
4. As a reader on a very narrow phone, I want the nav links to wrap rather than
   overflow, so that nothing gets cut off at any width.
5. As a mobile reader, I want the search field to span the full content width, so
   that it is an easy tap target and I can see what I type.
6. As a mobile reader, I want the search results to appear directly under the
   full-width search field, so that results don't float away from what I typed.
7. As a mobile reader, I want the theme toggle to be an easy, unambiguous tap
   target, so that I don't hit a neighbouring control by mistake.
8. As a reader on a wide phone or small tablet, I want the nav to stay on one line
   while it fits, so that screens with room don't get phone-style stacking.
9. As a desktop reader, I want the site nav to look exactly as it does today —
   title, links, and search + theme toggle at the right — so that the mobile fix
   doesn't disturb my experience.
10. As a mobile reader of a post, I want the table of contents above the article
    content, so that I can see the post's structure before I start reading.
11. As a mobile reader, I want the table of contents collapsed behind a Contents
    disclosure by default, so that it doesn't push the article down the page.
12. As a mobile reader, I want to expand the disclosure with a single tap, so that
    I can reach the outline without hunting for it.
13. As a mobile reader, I want tapping a table-of-contents entry to take me to that
    section, so that I can skip to what interests me.
14. As a mobile reader, I want the disclosure to collapse again on a second tap, so
    that I can get it out of the way once I've jumped.
15. As a reader, I want the table of contents to highlight the section I'm currently
    reading, so that I always know where I am in the post.
16. As a desktop reader, I want the table of contents to stay a sticky rail on the
    right, expanded by default, so that my reading experience is unchanged.
17. As a desktop reader, I want the Contents label to actually collapse and expand
    the list when clicked, so that the clickable-looking label isn't a lie.
18. As a keyboard user, I want the disclosure operable with Enter and Space and the
    links reachable in reading order, so that I can use the nav and the table of
    contents without a mouse.
19. As a screen-reader user, I want exactly one table of contents exposed at a
    time, so that I don't hear duplicate navigation regions.
20. As a screen-reader user, I want the current section's entry marked as current
    in the table of contents, so that my assistive tech announces my position.
21. As a reader with JavaScript disabled, I want the nav rows and the top-placed
    table of contents to still work, so that the fixes aren't script-dependent.
22. As a mobile reader, I want to search posts and switch themes exactly as on
    desktop, so that no functionality is lost on my phone.
23. As a reader, I want the page to load without shifting under my fingers, so
    that my taps land where I intend.
24. As a reader on a dark or light theme, I want the reflowed nav and the
    disclosure to match the current design language, so that the fixes don't look
    bolted on.
25. As a maintainer, I want the rail and inline tables of contents rendered from
    one component with two variants, so that they cannot drift apart.
26. As a maintainer, I want regression tests at the mobile viewport, so that both
    reported problems cannot silently return.
27. As a maintainer, I want tests to assert only visitor-observable behaviour, so
    that refactors of the implementation don't break them.
28. As a maintainer, I want the rendering duplication of the table of contents
    explained in a lean comment, so that future editors don't "clean it up"
    without knowing why it exists.
29. As a maintainer, I want the terms "site nav" and "table of contents" pinned in
    the glossary, so that future specs and tickets use one name for each.

## Implementation Decisions

- **Site nav DOM**: the theme toggle is promoted out of the search wrapper to become
  a direct child of the nav container, so the mobile grid can place it on the first
  row. Desktop flex order keeps search and toggle together at the right; the
  desktop visual is unchanged.
- **Site nav mobile arrangement**: at phone widths (≤480px — the arrangement's
  natural failure point is ≈470px) the nav container becomes a CSS grid with named
  areas: title + theme toggle on row one, nav links spanning row two, search
  spanning row three. The nav-link list becomes wrappable so it survives the
  narrowest phones. The search input takes the full row width at these widths; the
  desktop expand-on-focus behaviour is untouched.
- **Breakpoints are deliberately not unified**: nav stacking at ≤480px, table-of-
  contents relocation at the existing 900px post-layout breakpoint. Each fix
  follows its own layout's failure point; widths that aren't broken stay as they
  are.
- **Table-of-contents component** gains a `rail` / `inline` variant. The rail
  variant is a disclosure rendered open — the existing sticky 200px right rail.
  The inline variant is a collapsed disclosure with a Contents summary, full width
  and static, placed inside the article directly after the post header (title,
  date, tags).
- **The component renders twice on post pages** (one copy per variant), each shown
  at its breakpoint and hidden otherwise. The hidden copy is display-none, hence
  out of the accessibility tree. Rationale: DOM order equals visual order, the fix
  works without JavaScript, and there is no node-moving or resize handling. A lean
  comment near the render records the rationale.
- **The Contents label becomes a real summary toggle in both variants**, replacing
  the misleading pointer-cursor styling that promised a click which did nothing.
  The one deliberate desktop behaviour change: the label now collapses the list;
  desktop layout is otherwise byte-identical.
- **Scrollspy** is driven per table-of-contents instance rather than assuming a
  single instance; the active entry is marked with `aria-current`.
- **No-JS safety and no layout shift**: everything visible at load is CSS; the
  disclosure is native.
- **Aesthetic**: the mono bracket lkml.org language is kept. No hamburger menu, no
  link culling, no horizontal scroll strips, no new dependencies.
- **Docs**: glossary entries for Site nav and Table of contents are added as part
  of this work. ADR check: reversible component and CSS work with no surprising
  trade-off — no ADR.

## Testing Decisions

- **What makes a good test here**: external behaviour only — what a visitor sees
  and does at a viewport. Visible elements, on-screen arrangement (rendered
  geometry such as bounding boxes is observable; CSS property values are not),
  tap outcomes, navigation destinations, and accessibility state exposed to
  assistive tech (`aria-current`, disclosure state). Never markup duplication,
  stylesheet internals, or script internals.
- **One seam, the highest available**: the browser seam — Playwright in Chromium
  against the real built site. Existing seams are preferred and sufficient: the
  built-HTML seam gains nothing new, and no new seam is introduced. Prior art:
  the existing browser specs (the search-click spec and the homepage spec), which
  also establish role-based locators and the "external behaviour only" rule.
- **Mobile viewport (375×812)**:
  - the table-of-contents disclosure is visible above the article content,
    collapsed by default;
  - tapping the summary expands it; entries navigate to their sections;
  - the site nav shows the approved row arrangement: site title + theme toggle on
    row one, nav links on row two, search spanning the full content width on
    row three.
- **Desktop viewport (1280×800), regression guards**:
  - the site nav is on one line;
  - the table of contents is the right-side rail, expanded by default;
  - the Contents label collapses and re-expands the list.
- **Cross-cutting**: after jumping to a section, that entry carries `aria-current`.
- **Pipeline**: the existing `pnpm test` entrypoint (build, built-HTML tests,
  browser tests) stays the single command; the new specs join the browser suite.

## Out of Scope

- Any redesign of the desktop layout or the bracket aesthetic.
- Hamburger/disclosure menus for the nav links, culling nav links on mobile, or
  horizontal scrolling link strips.
- A single unified mobile breakpoint.
- Table of contents on non-post pages; persisting the disclosure's expanded state
  across navigations.
- Changes to the nav's destinations, the search matching behaviour, or the theme
  toggle's cycle.
- The desktop search expand-on-focus behaviour.
- A sticky/fixed mobile header, back-to-top control, or other navigation
  affordances not requested.
- Accessibility or performance work beyond the elements this spec touches.

## Further Notes

- Measurements from the grilling session (375×812): the nav stacks into three
  ragged rows (title alone, links intact with 23px slack — they overflow below
  ≈376px because the link list cannot wrap), and the table of contents sits at the
  very bottom of the post page (below the prev/next links, above the footer).
- The desktop Contents label currently advertises clickability (pointer cursor)
  with no click handler behind it — this spec resolves that as a side effect of
  making the disclosure real.
- The glossary gained **Site nav** and **Table of contents** during the design
  session; future tickets in this area should use those names and avoid "header",
  "navbar", "outline", "sidebar".
