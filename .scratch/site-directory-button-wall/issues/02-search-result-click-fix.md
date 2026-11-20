# 02: Fix search-result clicks on the left half of a row

**What to build:** Clicking anywhere on a search result row opens the post. A press-and-release click on the left half of a row — the region the collapsing search bar used to slide out from under — navigates to the post instead of merely contracting the search bar. Behaviour is otherwise unchanged: results open on focus and input, close on outside click, links open in the same tab.

**Blocked by:** 01 — Test foundation: built-HTML and browser test seams

**Status:** ready-for-agent

- [ ] A real-browser test drives a mousedown+mouseup+click sequence on the left half of a result row and observes navigation to the post
- [ ] The same test shows results collapsing only via outside click or after navigation — never swallowing the row click
- [ ] Right-half clicks still work
- [ ] Search open/close behaviour and result matching are unchanged
