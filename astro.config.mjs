import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  site: 'https://ht4w5.github.io',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'append',
        properties: { className: ['heading-anchor'] },
        content: { type: 'text', value: '#' },
      }],
    ],
  },
});
