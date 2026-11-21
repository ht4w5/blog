# CONTEXT.md — ht4w5.github.io

Single-context repo. Vocabulary for domain terms is in [`GLOSSARY.md`](GLOSSARY.md); recorded decisions live in `docs/adr/` (currently none).

A personal blog built with [Astro](https://astro.build) and hosted on [GitHub Pages](https://pages.github.com).

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Creating Posts

Create a new markdown file in `src/content/blog/` with the following frontmatter:

```markdown
---
title: "Your Post Title"
description: "Optional description for excerpts and search"
date: "2025-01-15"
tags: ["tag1", "tag2"]
lang: "en"
draft: false
---

Your post content here...
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | The post title |
| `description` | No | Custom excerpt (auto-generated from first 160 chars if omitted) |
| `date` | Yes | Publication date in `YYYY-MM-DD` format (e.g., `2025-01-15`) |
| `tags` | No | Array of tag strings (default: `[]`) |
| `lang` | No | Post language: `en` or `zh-CN` (default: `en`) |
| `draft` | No | Set to `true` to hide from public site (default: `false`) |

### Drafts

Posts with `draft: true` in frontmatter are excluded from:
- The homepage and the posts page
- Tag pages
- The search index
- The RSS feed

Drafts are only visible during development (`pnpm dev`).

## Deployment

Deployment is manual via `./deploy.sh`:

1. Create a repository named `ht4w5.github.io` on GitHub
2. Add the remote: `git remote add origin git@github.com:ht4w5/ht4w5.github.io.git`
3. Run `./deploy.sh`, which will:
   1. Build the Astro site (`pnpm astro build`)
   2. Add `.nojekyll` to the build output
   3. Push the `dist/` contents to the `main` branch of the deploy repo

## Configuration

### Site URL

Update `site` in `astro.config.mjs` if your domain changes:

```javascript
export default defineConfig({
  site: 'https://ht4w5.github.io',
  // ...
});
```

### About Page

Edit `src/data/about.md` to customize your about page content. It is rendered by
`src/pages/about.astro`, which reads the page metadata from the Markdown frontmatter.

## Features

- **Markdown posts** with frontmatter validation
- **Syntax highlighting** for code blocks
- **Tags** with filtered tag pages
- **Posts page** with a fuzzy filter powered by the Fuse.js search index
- **RSS feed** at `/feed.xml` with auto-discovery
- **Homepage** showing the 10 most recent posts, with the full list at `/posts`; tag pages keep numbered pagination at 20 posts per page
- **Draft support** for work-in-progress posts
- **Bilingual posts** (English and Simplified Chinese) via per-post `lang`
- **Custom 404 page**
- **Minimal design** inspired by lkml.org

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- [Fuse.js](https://fusejs.io) - Fuzzy search
- [GitHub Pages](https://pages.github.com) - Hosting (via `deploy.sh`)
