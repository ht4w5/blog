import { getCollection } from 'astro:content';
import { generateExcerpt } from '../utils/excerpt';

export async function GET() {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  const searchIndex = posts.map((post) => ({
    slug: post.id,
    title: post.data.title,
    tags: post.data.tags,
    excerpt: generateExcerpt(post.data.description, post.body),
    date: post.data.date,
  }));

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
