# 01: Project skeleton

**What to build:** Astro project scaffolded with all dependencies installed, content schema defined, base layout + global CSS rendering, excerpt utility working, and a hello-world example post. No pages yet — just the foundation that everything else builds on.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Astro project initialized with static output
- [ ] `@astrojs/rss`, `@astrojs/sitemap`, and `fuse.js` installed
- [ ] `content.config.ts` defines blog collection schema (title, description, date, tags, draft)
- [ ] `global.css` implements lkml.org-inspired simple style (system sans-serif body, monospace code, 720px max-width, #fafafa/#1a1a1a/#3366aa palette)
- [ ] `BaseLayout.astro` renders nav bar (`ht4w5` home link, `about`, `tags` links) + search input placeholder + feed `<link rel="alternate">` in head
- [ ] `excerpt.ts` utility generates excerpt from description field or first ~160 chars of body with markdown stripped
- [ ] `hello-world.md` example post exists with valid frontmatter
- [ ] `pnpm astro build` succeeds with no errors
