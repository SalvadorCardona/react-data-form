---
"react-data-form": minor
---

The default theme (`react-data-form/styles.css`) now follows the Hermez design system instead of shadcn's neutral greys. Visible only if you import that stylesheet; an app that declares its own theme variables is unaffected.

- Colours: warm "stone" greys (background `#fafaf9`, text `#1c1917`, secondary text `#57534e`, border `#e7e5e4`, fields `#d6d3d1`), orange primary `#bf4a02` with white text, focus ring `#e46212`, highlight `#fff6ee`. The `.dark` variant keeps the same hue (background `#0c0a09`, primary `#ff8b44`).
- Radius: `--radius` goes from `0.875rem` to `0.75rem`, and `--radius-2xl` to `--radius-4xl` are now derived from it, so square-cornered themes no longer get pill-shaped buttons.
- Fonts: `--font-sans` becomes the system font stack, and new `--typeface-heading` / `font-heading` point to "Bricolage Grotesque Variable" with a system fallback. The library ships no font and no rule on your `h1`–`h6`.
- New tokens: `--success`, `--info`, `--glory`, `--warning`, `--chart-1` to `--chart-5`, and warm-tinted `shadow-sm` / `shadow-md` / `shadow-lg` (plus `shadow-glow`).
