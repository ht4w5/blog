import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { generateExcerpt } from '../utils/excerpt';

export async function GET() {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: 'ht4w5',
    description: 'ht4w5\'s blog',
    site: 'https://ht4w5.github.io',
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    customData: '<language>en</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: generateExcerpt(post.data.description, post.body),
      link: `/blog/${post.id}/`,
      author: 'ht4w5',
      categories: post.data.tags,
      customData: `<dc:language>${post.data.lang}</dc:language>`,
    })),
  });
}
