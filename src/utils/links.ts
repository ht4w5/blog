/**
 * External-link policy for linked destinations on the site: an absolute
 * http(s) URL is an external destination and opens in a new tab with safe
 * rel attributes; root-relative destinations stay in the same tab and get no
 * extra attributes. Shared by every component that renders a destination, so
 * the policy has one definition.
 */

/** The attributes a destination's anchor needs, per the external-link policy. */
export function externalLinkAttrs(href: string): {
  target?: '_blank';
  rel?: 'noopener noreferrer';
} {
  return /^https?:\/\//.test(href)
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};
}
