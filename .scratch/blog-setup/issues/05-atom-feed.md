# 05: Atom feed + auto-discovery

**What to build:** Atom feed at `/feed.xml` generated from all non-draft posts. Auto-discovery `<link>` tag in the `<head>` of every page.

**Blocked by:** 01-project-skeleton

**Status:** ready-for-agent

- [ ] `/feed.xml` generates a valid Atom feed from all non-draft posts
- [ ] Feed entries include title, date, link, and content/excerpt
- [ ] `<link rel="alternate" type="application/atom+xml" title="ht4w5" href="/feed.xml" />` in `<head>` of every page
- [ ] Feed validates as valid Atom XML
