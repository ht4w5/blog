# Spec: Astro Blog on GitHub Pages

## Problem Statement

I want a personal blog hosted on GitHub Pages at `ht4w5.github.io`. It should support markdown articles, tags, search, and an about page, with a simple, minimal aesthetic inspired by lkml.org's CSS style (plain, monospace-leaning, no decoration). The blog should be easy to maintain — writing a post should be as simple as adding a markdown file.

## Solution

Build a static blog using Astro 7 with content collections, deployed to GitHub Pages via GitHub Actions. The blog uses a single-column layout with system sans-serif for body text and monospace for code. Inline search powered by Fuse.js lives in the header. Tags are clickable pills that navigate to filtered tag pages. An Atom feed is generated automatically.

## User Stories

1. As a **reader**, I want to see a chronological list of posts on the homepage, so that I can find the latest content
2. As a **reader**, I want to click a post title and read the full article, so that I can consume the content
3. As a **reader**, I want to see the publication date of each post in RFC 3339 format, so that I know how recent the content is
4. As a **reader**, I want to see tags as inline pills next to each post title, so that I can quickly identify topics
5. As a **reader**, I want to click a tag pill and see all posts with that tag, so that I can explore related content
6. As a **reader**, I want to see all available tags with post counts on a `/tags` page, so that I can browse topics
7. As a **reader**, I want to search posts by title, tags, or content from the header, so that I can find specific posts quickly
8. As a **reader**, I want search results to show the post title and date, so that I can identify the right result
9. As a **reader**, I want to see "No results found" when my search matches nothing, so that I know the search worked
10. As a **reader**, I want to navigate between posts using prev/next links at the bottom of each article, so that I can read sequentially
11. As a **reader**, I want a "Back to list" link at the bottom of each article, so that I can return to the homepage
12. As a **reader**, I want to read an about page, so that I can learn about the author
13. As a **reader**, I want my RSS reader to auto-discover the feed from any page, so that I can subscribe without hunting for the feed URL
14. As a **reader**, I want an Atom feed at `/feed.xml`, so that I can follow the blog in my RSS reader
15. As a **reader**, I want to see a custom 404 page when I visit a broken link, so that the experience feels intentional
16. As a **reader**, I want inline images in posts to render properly, so that I can see screenshots and diagrams
17. As a **reader**, I want code blocks to have syntax highlighting, so that I can read code examples easily
18. As a **reader**, I want the blog to be fast and lightweight, so that it loads instantly on any device
19. As an **author**, I want to write posts in markdown with frontmatter, so that I don't need to touch HTML
20. As an **author**, I want the build to validate my frontmatter schema, so that I catch metadata errors before publishing
21. As an **author**, I want to set `draft: true` in frontmatter to hide a post from the public site, so that I can work on posts before publishing
22. As an **author**, I want to optionally set a `description` in frontmatter, so that I control the excerpt shown on the list and in search
23. As an **author**, I want the excerpt to auto-generate from the first ~160 characters of the post body when I don't set a description, so that I don't have to write one for every post
24. As an **author**, I want posts to be paginated at 20 per page with numbered controls, so that the homepage doesn't become unwieldy
25. As an **author**, I want to deploy by pushing to `main`, so that publishing is automatic
26. As an **author**, I want to manage the about page content myself, so that I can update it independently of the blog engine
27. As a **reader**, I want the date `datetime` attribute to carry full RFC 3339 precision even when the display shows the same value, so that machines and feed readers get proper semantics
28. As a **reader**, I want to see the full RFC 3339 timestamp displayed on posts (e.g. `2025-01-15T10:30:00+08:00`), so that I have precise publication time
29. As a **reader**, I want pagination controls hidden when there's only one page of posts, so that the UI stays clean
30. As a **reader**, I want to see "No posts tagged '[tag]'" with a link to `/tags` when I visit an invalid tag URL, so that I can recover gracefully

## Implementation Decisions

### Content Collection Schema

The blog uses Astro content collections with a Zod schema. Each post is a markdown file in the `blog` collection with these fields:

- `title` (string, required)
- `description` (string, optional — fallback to auto-excerpt)
- `date` (string, RFC 3339 with timezone offset, required)
- `tags` (array of strings, default `[]`)
- `draft` (boolean, default `false`)

Drafts are excluded from all public pages, the search index, and the RSS feed at query time.

### Auto-Excerpt Generation

When a post has no `description` in frontmatter, the excerpt is generated from the first ~160 characters of the post body with markdown syntax stripped and truncation at a word boundary (appending `…`). This logic lives in a shared utility module used by both the search index endpoint and the post list page.

### Styling

A single global CSS file defines all styles. No CSS framework, no Tailwind. The aesthetic is simple and plain, inspired by lkml.org's CSS approach — not its table layout.

- **Body text:** system proportional sans-serif stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- **Headings:** same font family as body, bolder weight and larger size
- **Code:** monospace stack (`'Courier New', Consolas, monospace`), with Shiki syntax highlighting (Astro built-in)
- **Layout:** single column, max-width 720px, centered
- **Palette:** `#fafafa` background, `#1a1a1a` text, `#3366aa` links, `#f0f0f0` code block background

### Navigation

A top nav bar contains the site title (`ht4w5`, linking to `/`) and links to `about` and `tags`. An inline `<input>` search box sits in the nav bar. No separate `/search` page — search is entirely inline.

### Search Implementation

The search index is a JSON file generated at build time via an Astro endpoint. It contains an array of objects with `slug`, `title`, `tags`, `excerpt`, and `date` for every non-draft post. The inline search input fetches this JSON once (cached), then filters client-side using Fuse.js with fuzzy matching on `title`, `tags`, and `excerpt`. Results appear in a dropdown below the input showing title and date per row.

### Pagination

Post lists are paginated at 20 items per page. Pagination UI uses numbered page links with prev/next arrows (e.g., `← 1 2 3 →`). Pagination controls are hidden when there's only one page.

### Post Navigation

Each post page shows at the bottom:
- Link to the previous (older) post, if one exists
- Link to the next (newer) post, if one exists
- A "← Back to list" link to the homepage

### Feed

An Atom feed is generated at `/feed.xml` from all non-draft posts. A `<link rel="alternate" type="application/atom+xml">` tag is included in the `<head>` of every page for auto-discovery.

### Images

Inline markdown images (`![alt](url)`) are supported in post content. No hero/banner images, no image galleries, no frontmatter image field.

### Deployment

A GitHub Actions workflow triggers on push to `main`. It checks out the repo, installs pnpm and dependencies, runs `astro build`, and deploys the `dist/` directory to GitHub Pages using the official `actions/upload-pages-artifact` and `actions/deploy-pages` actions.

### Testing Seams

Three seams are used for verification:

1. **Content schema** — the Zod schema in `content.config.ts` validates frontmatter at build time. Invalid frontmatter causes a build failure.
2. **Build output** — the `dist/` directory contains all rendered HTML, CSS, JSON, and the feed. Inspecting this output verifies that layouts, pagination, tag pages, prev/next links, and 404 all render correctly.
3. **Search index endpoint** — the `/search-index.json` output is a distinct data pipeline. It can be verified independently for correct shape, draft exclusion, and excerpt generation.

## Out of Scope

- **CMS or admin interface** — posts are managed as markdown files in the repo
- **Comments** — no commenting system
- **Analytics** — no tracking or analytics
- **Dark mode** — single light color scheme only
- **i18n** — single language (English)
- **Custom domain** — using `ht4w5.github.io` as-is
- **Image optimization pipeline** — inline markdown images only, no `<Image />` component usage beyond what Astro does by default
- **Separate `/search` page** — search is inline in the header only
- **Author field in frontmatter** — single-author blog, no per-post author metadata
- **Draft visibility in production** — drafts are never visible outside dev mode

## Further Notes

- The repo is `ht4w5/ht4w5.github.io` on GitHub (not yet created)
- Node 22 and pnpm 10 are available in the environment
- Astro 7.3.3 is installed globally
- No remote is configured yet — the spec file and code will be pushed once the GitHub repo is created
- The `about` page content is managed by the user independently of this spec