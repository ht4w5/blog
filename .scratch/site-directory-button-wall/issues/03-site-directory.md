# 03: Site directory page with `[paths]` nav item

**What to build:** A reader can discover everything else published under the domain. A new `[paths]` item in the header nav (after `[tags]`, before `[feed]`) leads to the **site directory** page: a short title, a 1–2 sentence intro, then the **directory entries** in deliberate order — each a label link with an optional muted one-line description. Off-domain entries open in a new tab safely. The maintainer adds or reorders entries by editing a typed data file only.

**Blocked by:** 01 — Test foundation: built-HTML and browser test seams

**Status:** ready-for-agent

- [ ] The nav shows `[paths]` on every page and it leads to the site directory
- [ ] Entries render in data-file order with their label and optional description
- [ ] Root-relative entries link in the same tab; absolute-URL entries open in a new tab with safe rel attributes
- [ ] Adding or reordering an entry is a data-file edit requiring no markup changes
- [ ] Built-HTML tests cover the directory page and the nav item
