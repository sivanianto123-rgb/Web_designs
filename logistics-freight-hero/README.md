# Logistics Freight Hero

A full-viewport, overflow-hidden hero section for a logistics/freight
brand: an aerial freight-train video fills the screen, with headline
copy and two feature blocks composed on the train's vertical center
axis and mirrored across it. A single ~1.8s entrance animation plays
on load, then everything is still — only the background video loops.
No scroll.

## Stack

- No build step — a single standalone `index.html`, open it directly
  or serve it.
- All CSS is inline in `<style>`; no external CSS/JS frameworks.
- The only external asset is the background video, loaded from a
  CloudFront URL (also used as a `<link rel="preload">`).
- Two `@font-face` families (`Display`, `UI`) are declared with
  metric-matching overrides and resolved via `local()` to installed
  condensed grotesques (Oswald / Bebas Neue / Barlow Condensed /
  Impact as fallbacks), so no font files are bundled.

## Run locally

```bash
cd logistics-freight-hero
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` directly in a browser.

## Structure

```
logistics-freight-hero/
└── index.html   # markup, inline CSS, entrance animation, all breakpoints
```

## Layout

- **Desktop / landscape**: a 1280×800 "stage" is centered and scaled
  to fit the viewport (`--s: min(100vh/800, 100vw/716)`), with every
  element pixel-positioned and mirrored across the train's center
  axis.
- **Tablet portrait** (`min-width:610px` and `max-aspect-ratio:1/1`):
  reflows into a CSS grid with a center "rail" column, features placed
  side by side on either side of the rail.
- **Phone** (`max-width:609px`): single-column grid; the two feature
  blocks stay mirrored (one right-aligned, one left-aligned) rather
  than both being centered, preserving the left/right identity of
  each block.

## Customizing

- Swap the background video by changing the `src` on `.bg` and the
  `href` on the `<link rel="preload">` — keep both in sync.
- Headline copy lives in the four `.headline span` elements
  (`.hl1`–`.hl4`); colors are CSS variables on `:root`
  (`--cream`, `--white`, `--ink`, `--accent`).
- Entrance animation timing/easing is defined in the
  `@media (prefers-reduced-motion:no-preference)` block near the
  bottom of `<style>` — it's skipped entirely when the user prefers
  reduced motion.
