# 01: Test foundation: built-HTML and browser test seams

**What to build:** A working test harness for the blog so every later change ships with regression coverage. A single test command from a clean checkout builds the site and asserts against the emitted HTML with Node's built-in test runner, and runs one Playwright spec against the preview server proving real-browser interaction tests work. Not user-visible: its output is a green test command and two documented seams — built HTML and browser interaction — that later tickets extend.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A test command runs from a clean checkout and exits green
- [ ] A built-HTML smoke test builds the site and asserts something observable about the emitted homepage
- [ ] A Playwright smoke test starts the preview server and asserts something observable in a real browser
- [ ] Tests assert only external behaviour (rendered HTML, observable interaction), never CSS property values or script internals
- [ ] A short test README (or equivalent) documents the two seams and how to add assertions to each
