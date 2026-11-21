# Spec: Site nav simplification, posts page with filter, homepage trimming, and table-of-contents sizing

**Status:** ready-for-agent

## Problem Statement

1. The **table of contents** text is too small to read comfortably (12px mono entries,
   a 12.8px label). It is also folded behind a disclosure that must be tapped open on
   narrow screens, and whose "Contents" label doubles as a collapse toggle — a
   behaviour nobody asked for. Readers want the list visible and readable at all times.
2. The **site nav** carries an embedded search widget that crowds the bar and forces
   awkward arrangements on phones. Searching posts deserves its own home: a dedicated
   posts page with a search bar on top that filters the post list. Meanwhile the
   theme toggle is stranded beside the search field instead of sitting with the other
   nav links, and there is no `[home]` link even though the bracket list is the
   natural place for one.
3. The **homepage** lists every post (paginated in pages of 20), competing with the
   new posts page's job. It should showcase only the 10 most recent posts and point
   readers to the full list.

## Solution

1. The table of contents text is enlarged (entries to 14px, the Contents label to
   body size and bold). Folding is removed entirely: the entries are always visible
   in both placements — the sticky right rail on wide screens and the copy above the
   article on narrow screens — and the Contents label is a plain static heading.
2. The site nav becomes a tidy bracket bar: `[home]`, `[posts]`, `[about]`, `[tags]`,
   `[dirs]`, `[feed]`, and the theme toggle as the final bracket item, its label
   showing the current mode. The embedded search widget is removed from the nav. A
   new posts page at `/posts` shows the complete post list with a full-width search
   bar on top that instantly filters posts as the reader types — same fuzzy matching
   the old nav search used.
3. The homepage shows exactly the 10 most recent posts, followed by a bracket-style
   `[all posts]` link to the posts page. The numbered pagination pages are removed.

## User Stories

1. As a reader, I want the table-of-contents entries in a comfortably readable size,
   so that I can scan the list without squinting.
2. As a reader, I want the table of contents entries always expanded, so that I can
   see the post's structure without tapping anything.
3. As a mobile reader, I want the table of contents above the article to be fully
   visible on arrival, so that I can jump to a section immediately.
4. As a desktop reader, I want the sticky right rail's entries always visible, so
   that my reading experience needs no interaction.
5. As a reader, I want the Contents label to be a plain heading rather than a
   control, so that nothing in the interface promises a click it doesn't need.
6. As a reader, I want the table of contents to keep marking the section I'm
   currently reading, so that I always know where I am in the post.
7. As a mobile reader, I want the site nav to stack into two deliberate rows — the
   site title, then the bracket links — so that the bar reads as a tidy unit on my
   phone.
8. As a reader on a very narrow phone, I want the bracket nav links to wrap rather
   than overflow, so that nothing gets cut off at any width.
9. As a desktop reader, I want the site nav on one line with the site title at the
   left and the bracket links grouped at the right, so that the bar looks deliberate
   rather than ragged.
10. As a reader, I want a `[home]` nav link, so that I can return to the homepage
    from anywhere without hunting for the site title.
11. As a reader, I want the theme toggle to sit with the other nav links as the last
    bracket item, so that all site-level controls live in one place.
12. As a reader, I want the theme toggle's label to show the current mode
    (`[system]`, `[dark]`, or `[light]`), so that I know which mode I'm in before I
    click.
13. As a reader, I want clicking the theme toggle to cycle system → dark → light as
    it always has, so that no theme behaviour is lost in the move.
14. As a reader, I want the nav search widget gone, so that the site nav is not
    crowded by a control I can now find on the posts page.
15. As a reader, I want a posts page at `/posts` reachable via the `[posts]` nav
    link, so that I have one place to browse and search every post.
16. As a reader on the posts page, I want a search bar at the top that filters the
    post list instantly as I type, so that I find posts without submitting anything.
17. As a reader, I want the filter to be fuzzy, so that typos and near-matches still
    find the post I mean — exactly like the old nav search did.
18. As a reader, I want the filter to match against post titles, tags, and excerpt
    text, so that I can find a post whichever detail I remember.
19. As a reader, I want the filter bar to span the full content width, so that it is
    an easy tap target and I can see what I type.
20. As a reader, I want every matching post to stay in the filtered list, so that I
    see the complete result set rather than a truncated one.
21. As a reader, I want a `no posts match` line when the filter matches nothing, so
    that an empty result is explained rather than confusing.
22. As a reader, I want the posts page to list every post, newest first, with no
    pagination, so that the page is the complete archive.
23. As a reader, I want the homepage to show only the 10 most recent posts, so that
    the landing page stays a quick, current snapshot.
24. As a reader, I want an `[all posts]` link below the homepage's recent posts, so
    that I can reach the complete list from the landing page.
25. As a reader with JavaScript disabled, I want the posts page to show the complete
    post list with no dead filter control, so that the page never lies about what it
    can do.
26. As a keyboard user, I want the theme toggle and all nav links reachable in
    reading order and operable with Enter and Space, so that I can use the site nav
    without a mouse.
27. As a screen-reader user, I want exactly one table of contents exposed at a time,
    so that I don't hear duplicate navigation regions.
28. As a screen-reader user, I want the theme toggle to announce that it changes the
    theme (not just its current mode), so that I know what activating it does.
29. As a screen-reader user, I want the filter input to have an accessible label, so
    that I know what the field filters.
30. As a reader, I want the page to load without shifting under my fingers, so that
    my taps land where I intend.
31. As a reader on a dark or light theme, I want the reworked nav, the posts page,
    and the enlarged table of contents to match the current design language, so that
    nothing looks bolted on.
32. As a maintainer, I want the posts-page filter to reuse the existing search
    index and fuzzy matching, so that matching behaviour cannot drift from what the
    nav search did.
33. As a maintainer, I want regression tests at mobile and desktop viewports for the
    nav rows, the posts-page filter, the homepage trimming, and the always-expanded
    table of contents, so that these problems cannot silently return.
34. As a maintainer, I want tests to assert only visitor-observable behaviour, so
    that refactors of the implementation don't break them.
35. As a maintainer, I want the terms "site nav" and "table of contents" kept pinned
    in the glossary and its entries updated to match the new reality, so that future
    specs use one name for each.

## Implementation Decisions

- **Site nav arrangement**: the bracket list is `[home]`, `[posts]`, `[about]`,
  `[tags]`, `[dirs]`, `[feed]`, theme toggle — the toggle is the last bracket item.
  The site title remains a home link. Desktop keeps one line: title left, the whole
  bracket group (toggle included) right-aligned. At phone widths (≤480px) the nav
  container is a two-row grid — site title on row one, the bracket links on row two,
  wrappable so nothing overflows on the narrowest phones. The 480px nav breakpoint
  and the 900px post-layout breakpoint stay deliberately un-unified.
- **Theme toggle as a bracket item**: it remains a button (not a link) cycling
  system → dark → light with state persisted as today; its bracket-style label
  mirrors the current mode (`[system]`/`[dark]`/`[light]`) and updates when the mode
  changes; its accessible name says it changes the theme. Only its position and
  presentation change.
- **Nav search removal**: the embedded search widget — markup, dropdown script,
  styles, and the desktop expand-on-focus behaviour — is removed outright; the
  expand-on-focus behaviour dies with the widget it belonged to. The search index
  endpoint and the fuzzy-search dependency are kept and repurposed as the posts
  page's data source.
- **Posts page**: a new `/posts` route renders a page heading `Posts`, a
  full-content-width filter input directly beneath it (mono input styling, but no
  expand-on-focus — it is a fixed page control), and the complete post list below,
  newest first, in the existing post-entry markup shared with the homepage and tag
  pages. The list is not paginated.
- **Filter behaviour**: instant filtering as the reader types, no submit button,
  using the existing fuzzy matching (the same three fields — title, tags, excerpt —
  and the same threshold and case behaviour as the old nav search). Every match
  stays visible (no result cap). No URL state: navigating away or reloading clears
  the filter. When nothing matches, the list is replaced by a single muted
  `no posts match` line. The input's placeholder is `filter posts` and it carries an
  accessible label. Matching runs over the search index the existing endpoint
  already serves.
- **No-JS safety on the posts page**: the filter input is rendered hidden and
  revealed by the script that wires up filtering; with JavaScript disabled the page
  is the plain complete list with no inert control visible. Everything else on the
  page is static HTML.
- **Homepage trimming**: the homepage renders exactly the 10 most recent posts in
  the existing post-entry markup, followed by one bracket-style `[all posts]` link
  to `/posts`. The numbered pagination route (page 2…N with prev/next) is removed —
  the posts page supersedes it. Tag pages' pagination is untouched.
- **Table of contents sizing and de-folding**: entry text is enlarged from 12px to
  14px mono; the Contents label goes from 12.8px to body size (16px) and bold. The
  disclosure markup is removed: both variants render a static, non-interactive
  Contents heading followed by the always-visible entries. The dual render stays —
  the sticky right rail variant on wide screens and the inline variant above the
  article at the post-layout breakpoint, each shown at its breakpoint and
  display-none otherwise — along with the per-instance scrollspy and `aria-current`
  marking. The rail's layout and stickiness are otherwise unchanged; the deliberate
  desktop behaviour change shipped by the previous spec (label-as-toggle) is removed
  along with the toggle.
- **This spec deliberately reverses parts of the previous mobile-nav-toc spec** (the
  collapsible table-of-contents disclosure, the label-as-toggle, the nav search
  cluster, and the three-row mobile grid that existed to accommodate it). The
  component keeps the variant split and per-instance scripting that effort
  introduced; only the folding and the nav's extra rows go.
- **Docs**: glossary entries for Site nav and Table of contents are updated to match
  the new reality (no search cluster, no folding). ADR check: reversible component
  and CSS work with no surprising trade-off — no ADR.

## Testing Decisions

- **What makes a good test here**: external behaviour only — what a visitor sees and
  does at a viewport. Visible elements, on-screen arrangement (rendered geometry
  such as bounding boxes is observable; CSS property values are not), tap and typing
  outcomes, navigation destinations, and accessibility state exposed to assistive
  tech (toggle accessible name, label presence, exactly one table of contents in the
  accessibility tree). Never markup duplication, stylesheet internals, or script
  internals.
- **Seams — the existing two, no new ones**: the browser seam (Playwright in
  Chromium against the real built site) is the highest available and carries the
  behavioural tests; the built-HTML seam (node's test runner over the built output)
  covers static structure — e.g. that the removed nav search markup is gone and the
  posts-page input is script-revealed. Prior art: the existing browser specs
  (site-nav, table-of-contents, layout-stability, search-click) and the built-HTML
  tests, including their role-based-locator and external-behaviour-only conventions.
- **Mobile viewport (375×812)**:
  - the site nav shows the two-row arrangement: title row, bracket links row —
    asserted at several widths ≤480px;
  - the table of contents above the article is visible and fully expanded on load;
  - the posts page filter is usable and filters the list as the reader types.
- **Desktop viewport (1280×800), regression guards**:
  - the site nav is on one line, title left and the bracket group right;
  - the table of contents is the right-side rail with entries visible on load and
    no interactive label;
  - the homepage lists exactly 10 posts and exposes the `[all posts]` link;
  - the theme toggle sits last in the bracket group and its label tracks the mode
    across the cycle.
- **Cross-cutting**: filtering is pinned as fuzzy (a near-miss/typo query still
    finds its post) and visitor-observable (which posts are visible); after jumping
    to a section the entry carries `aria-current`; the no-JS posts page shows the
    full list with no filter input; the layout-stability guard from the previous
    effort keeps passing.
- **Pipeline**: the existing `pnpm test` entrypoint (build, built-HTML tests,
  browser tests) stays the single command; the new specs join the browser suite.
  Tests that pinned the reversed behaviour (search dropdown, disclosure toggling,
  three-row nav) are replaced, not kept.

## Out of Scope

- Any redesign of the desktop layout beyond the nav grouping, or of the bracket
  aesthetic.
- Regex, advanced query syntax, search-result highlighting, or a result cap on the
  posts-page filter.
- Persisting filter text in the URL or across navigations.
- Reintroducing any folding or remembered expanded/collapsed state for the table of
  contents.
- Unifying the post-entry markup that is currently repeated across the homepage,
  pagination, and tag pages into a shared component (the posts page uses the same
  markup; extraction is a separate refactor).
- Changes to tag pages' pagination, the RSS feed, the theme values or the toggle's
  cycle semantics, or post content rendering.
- A sticky/fixed mobile header, hamburger menu, back-to-top control, or other
  navigation affordances not requested.
- Accessibility or performance work beyond the elements this spec touches.

## Further Notes

- The previous mobile-nav-toc spec's measurements still hold where relevant: the
  one-line desktop nav fits down to ≈616px viewport (now further, with the search
  cluster gone), but the ≤480px breakpoint stays per the deliberate non-unification
  of breakpoints.
- The known and accepted red in the footer built-HTML test (CC badge — maintainer
  decision recorded in the teal-accent spec) predates this work and is untouched;
  "`pnpm test` passes" in tickets means modulo that red.
- Visible strings this spec introduces: page heading `Posts`, placeholder
  `filter posts`, empty-result line `no posts match`, homepage link `[all posts]`,
  and the toggle mode labels `[system]`/`[dark]`/`[light]`.

## Comments

- Implementation complete on `integration/nav-posts-search` (tickets 01–04 resolved; code-review fix pass `b1844d1`, merged `019eaae`). `pnpm test` is green except the pre-existing accepted red in `tests/html/footer.test.mjs` (CC badge — maintainer decision in `.scratch/teal-accent/spec.md`).
- Flagged, pre-existing and out of scope: when a tag holds >20 posts, `src/pages/tags/[tag].astro`'s `getStaticPaths` collides on the first-page route, so `/tags/<tag>` renders page-2 content — surfaced by ticket 03's fixture tests; worth a follow-up ticket.
- Judgement call flagged: the code-review fix pass also truthed-up CONTEXT.md's stale feature bullets (inline search, 20-post pagination), beyond the spec's glossary-only docs decision.
- The suite is Chromium-only as before: the toggle's bracket glyphs are CSS pseudo-elements and are not asserted by tests; a one-time manual Safari look at the nav bracket rendering is cheap and worth doing (as with the previous effort's summary-marker check).
