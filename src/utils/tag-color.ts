export function tagHue(tag: string): number {
  let hash = 5381;
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) + hash) + tag.charCodeAt(i);
  }
  return Math.abs(hash) % 360;
}