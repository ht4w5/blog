# 03: Site directory page with `[paths]` nav item

**What to build:** A reader can discover everything else published under the domain. A new `[paths]` item in the header nav (after `[tags]`, before `[feed]`) leads to the **site directory** page: a short title, a 1–2 sentence intro, then the **directory entries** in deliberate order — each a label link with an optional muted one-line description. Off-domain entries open in a new tab safely. The maintainer adds or reorders entries by editing a typed data file only.

**Blocked by:** 01 — Test foundation: built-HTML and browser test seams

**Status:** resolved

- [x] The nav shows `[paths]` on every page and it leads to the site directory
- [x] Entries render in data-file order with their label and optional description
- [x] Root-relative entries link in the same tab; absolute-URL entries open in a new tab with safe rel attributes
- [x] Adding or reordering an entry is a data-file edit requiring no markup changes
- [x] Built-HTML tests cover the directory page and the nav item

## Comments

- Resolved on `integration/site-directory-button-wall` (`907a2c0`, `0888800`, `9566f7b`, `812d430`): `/paths` page driven by `src/data/site-directory.ts`, `[paths]` nav item after `[tags]`/before `[feed]`, absolute-URL directory entries open safely in a new tab. Post-review: shared external-link helper (`4ac1eda`).
- Amended after maintainer review: the `label` field is merged into `href` — a directory entry's label is its URL itself (e.g. `/tags`, `https://github.com/...`), rendered in monospace. Entries are now `{ href, description? }`.
