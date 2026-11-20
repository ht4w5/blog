# 06: Migrate footer badges to the button wall and clean the footer

**What to build:** The four existing footer badges move into the button wall as 88×31 buttons with their destinations preserved: the self-referential button (links to the site root and doubles as the link-to-me art), the CC licence button, the xjtumen button, and the GitHub button. The footer shows only the copyright line on every page, and the old footer-badge component and its CSS are removed.

**Blocked by:** 04 — Button wall on the homepage with placeholder buttons

**Status:** resolved

- [x] The four badges appear in the wall as 88×31 buttons with destinations preserved
- [x] The footer on every page shows only the copyright line
- [x] Old footer-badge markup and CSS are removed; nothing else renders in the footer
- [x] Built-HTML tests assert the clean footer across representative pages

## Comments

- Resolved on `integration/site-directory-button-wall` (`99e26f7`, `97e84b6`): footer reduced to the copyright line on every page; `FooterBadges.astro` and its CSS (incl. `--badge-height`) removed; the four destinations verified preserved in the button wall with regression coverage. Post-review: shared test helpers (`4ac1eda`).
- Amended after maintainer review: the CC BY-NC-SA badge stays in the footer as before (old paste-zone component and height-normalized rendering restored for it). The footer is the copyright line plus that badge; the migration covers the other three buttons (self, xjtumen, GitHub).
