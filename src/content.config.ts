import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    generateId: (opts) => {
      // For dir-based posts: dir/post-name.md → dir
      // For flat files:       post-name.md     → post-name
      const parts = opts.entry.split('/');
      return parts.length > 1 ? parts[0] : parts[0].replace(/\.md$/, '');
    },
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.union([z.string(), z.date()]).transform((val) =>
      typeof val === 'string' ? val : val.toISOString().slice(0, 10)
    ),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['en', 'zh-CN']).default('en'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
