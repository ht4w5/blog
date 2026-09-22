import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ht4w5.github.io',
  output: 'static',
  integrations: [sitemap()],
});
