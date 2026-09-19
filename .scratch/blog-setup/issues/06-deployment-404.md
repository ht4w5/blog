# 06: Deployment + 404

**What to build:** GitHub Actions workflow that deploys to GitHub Pages on push to main. Custom 404 page in blog style.

**Blocked by:** 01-project-skeleton

**Status:** ready-for-agent

- [ ] `.github/workflows/deploy.yml` triggers on push to main
- [ ] Workflow installs pnpm, runs `pnpm astro build`, deploys `dist/` to GitHub Pages
- [ ] Uses `actions/upload-pages-artifact` and `actions/deploy-pages`
- [ ] `src/pages/404.astro` renders "Page not found" in blog style
- [ ] Custom 404 page uses `BaseLayout` and matches site styling
- [ ] `README.md` documents how to create posts, deploy, and configure the blog
