import { defineConfig } from '@playwright/test';

// Fixed non-default port (astro dev/preview default is 4321).
const PORT = 4322;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/browser',
  use: {
    baseURL: BASE_URL,
  },
  // Server lifecycle is managed here: Playwright starts `astro preview`
  // before the tests and tears it down afterwards. Requires a built dist/,
  // which `pnpm test` produces as its first step.
  webServer: {
    command: `pnpm run preview --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
