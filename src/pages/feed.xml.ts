import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { generateExcerpt } from '../utils/excerpt';

export async function GET() {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: 'ht4w5',
    description: 'A personal blog',
    site: 'https://ht4w5.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: generateExcerpt(post.data.description, post.body),
      link: `/blog/${post.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
