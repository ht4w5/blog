# 03: Define "Accent color" in the project glossary

**What to build:** The project glossary defines **Accent color** as a first-class term: the single brand color used for links and interactive affordances. Future design discussions have one unambiguous word for the concept instead of drifting between "link color" and "brand color". The entry is implementation-free — no hex values, no token names — and follows the glossary's existing entry format with an _Avoid_ list.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] The glossary has an "Accent color" entry defining it as the brand color for links and interactive affordances
- [x] The entry contains no implementation details (no hex values, no token names, no file references)
- [x] The entry lists avoided synonyms ("link color", "brand color", "theme color")
- [x] The entry matches the format of the existing glossary entries

## Comments

- Resolved on `integration/teal-accent` (`68d0073`, merged `cf40c6a`): "Accent color" entry added to `GLOSSARY.md` matching the existing entry format, implementation-free, with the three avoided synonyms.
- Definitional use of "brand color" inside the definition kept deliberately: the spec mandates this wording, and the **Backref** entry sets the precedent (its definition uses "return link" while _Avoid_ lists "return link"). The _Avoid_ list governs how the term is referenced elsewhere, not its own definition.
