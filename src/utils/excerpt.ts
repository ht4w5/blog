/**
 * Generate an excerpt from a post.
 * Uses the description if provided, otherwise generates from body.
 */
export function generateExcerpt(
  description: string | undefined,
  body: string | undefined
): string {
  if (description) {
    return description;
  }

  if (!body) {
    return '';
  }

  // Strip markdown syntax
  const stripped = body
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]+`/g, '')
    // Remove images
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headings
    .replace(/#{1,6}\s+/g, '')
    // Remove bold/italic
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();

  if (stripped.length <= 160) {
    return stripped;
  }

  // Truncate at word boundary
  const truncated = stripped.substring(0, 160);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 120) {
    return truncated.substring(0, lastSpace) + '…';
  }

  return truncated + '…';
}
