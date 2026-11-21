import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  site: 'https://ht4w5.github.io',
  output: 'static',
  // Test enablement (nav-posts-search ticket 03): fixture builds target a
  // separate output dir so the tests can build the site with generated
  // fixture posts without touching the dist/ the pipeline tests.
  outDir: process.env.ASTRO_OUT_DIR ?? 'dist',
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, {
          behavior: 'append',
          properties: { className: ['heading-anchor'] },
          content: { type: 'text', value: '#' },
        }],
      ],
    }),
  },
});
