# 04: Button wall on the homepage with placeholder buttons

**What to build:** The homepage ends with a **buttons** section: a dense wrapping **button wall** of classic 88×31 pixel web buttons driven by a typed data file — linked **buttons** with a subtle hover affordance and safe external links, plus decorative **flair badges** with no click affordance. Every image renders at exactly 88×31 with no layout shift, crisply (pixelated rendering) so pixel art stays sharp on high-DPI screens, and animated GIF buttons animate natively. Every image carries descriptive alt text. Solid-colour 88×31 placeholder art ships at the final asset filenames, ready for drop-in replacement. The wall appears on the homepage only.

**Blocked by:** 01 — Test foundation: built-HTML and browser test seams

**Status:** ready-for-agent

- [ ] The homepage ends with a buttons section, under the heading `buttons`, after the post list and pagination
- [ ] The wall renders from a typed data file; entries without a destination render as flair badges with no pointer cursor
- [ ] All images render at exactly 88×31 with no layout shift, crisp pixel rendering, and native GIF animation
- [ ] Hover polish applies to linked buttons only; external links use safe rel attributes and open in a new tab
- [ ] Every image has descriptive alt text
- [ ] Solid-colour 88×31 placeholder art exists at the final asset filenames
- [ ] The wall is absent from every non-homepage page
- [ ] Built-HTML tests cover the wall's presence, fixed dimensions, alt text, and flair-badge rendering
