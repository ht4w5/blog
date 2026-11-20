# 01: Test foundation: built-HTML and browser test seams

**What to build:** A working test harness for the blog so every later change ships with regression coverage. A single test command from a clean checkout builds the site and asserts against the emitted HTML with Node's built-in test runner, and runs one Playwright spec against the preview server proving real-browser interaction tests work. Not user-visible: its output is a green test command and two documented seams — built HTML and browser interaction — that later tickets extend.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] A test command runs from a clean checkout and exits green
- [x] A built-HTML smoke test builds the site and asserts something observable about the emitted homepage
- [x] A Playwright smoke test starts the preview server and asserts something observable in a real browser
- [x] Tests assert only external behaviour (rendered HTML, observable interaction), never CSS property values or script internals
- [x] A short test README (or equivalent) documents the two seams and how to add assertions to each

## Comments

- Resolved on `integration/site-directory-button-wall` (`bfdca44`, `3b2dd54`): `pnpm test` builds the site, runs Node's built-in runner over `dist/` HTML, and runs Playwright against `astro preview`. Seams documented in `tests/README.md`. Post-review: `playwright install chromium` wired into the test command for clean checkouts (`4ac1eda`).
