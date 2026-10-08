# STRIDE — Never Stand Still

A fictional brand concept blending Nike's bold athletic performance energy
with Fastrack's youthful, street-edged attitude. Mostly a standard
single-page site — normal vertical scroll, sections stack top-to-bottom,
simple fade/slide-in reveals as you scroll into them — with one deliberate
exception: the Origin section is a pinned, crossfading scene-by-scene story
(see below), matching a reference the user asked to be matched. Every other
section avoids pinning/scroll-jacking/scroll-snap on purpose — an earlier
version of the whole site tried that everywhere and it didn't land well.

## Sections

1. **Hero** — "Built to move," with a CTA into the Collection.
2. **Origin** — told as a four-beat cinematic story, not a static
   paragraph. The section is 4x viewport height; a ScrollTrigger pins the
   viewport for that whole range while each beat's full-bleed background
   (a dark gradient, two product photos, a solid orange panel) crossfades
   in behind a bold headline with one accent-colored phrase, with progress
   dots tracking which beat is active. On narrow viewports or with
   `prefers-reduced-motion`, it falls back to four normal stacked
   full-height sections — no pin, no crossfade, just scroll to read each
   beat.
3. **By The Numbers** — stat counters that count up once when you scroll
   to them (not tied continuously to scroll position — they animate to
   their target over ~1.4s and stop).
4. **The Collection** — one product at a time, not a grid: six large
   panels stacked vertically, filterable by category (All Gear / Footwear /
   Wearables / Accessories). Each panel sharpens into focus as it nears
   the center of the viewport and blurs out toward the edges as you scroll
   past it (`filter: blur()` scrubbed to scroll position — the same idea
   as Framer Motion's `useTransform(scrollYProgress, [0, 1], ["blur(0px)",
   "blur(10px)"])`, just driven by GSAP ScrollTrigger instead).
5. **Worn By The City** — an infinite city-name marquee and quote cards.
6. **Join the Movement** — closing CTA.

## Theme

Orange (`--accent` / `--accent-deep`) and white/off-white (`--bg` /
`--bg-soft`), with near-black text. No other hues — product card backdrops
use warm gradient variants (amber, deep orange, rust) to stay within the
same family instead of introducing new colors.

## Stack

- No build step — static HTML/CSS/JS, open `index.html` directly or serve it.
- [GSAP](https://gsap.com/) + ScrollTrigger for: one-shot reveals
  (`.reveal-up` elements, product panels, and the stat counters fade/animate
  in once as they're scrolled to, `once: true`); the Collection's
  per-product focus blur (`scrub: true` — a continuous `filter` tied to
  scroll position, but on elements already in normal document flow, so
  nothing is pinned); and the Origin story's pin + crossfade (the one
  place on the site that pins the viewport — see Sections above).
- Scrolling is fully native everywhere except the pinned Origin story.
  No smooth-scroll library, no CSS scroll-snap anywhere.
- No custom cursor — just the regular system cursor throughout.
- GSAP and ScrollTrigger are vendored locally under `js/vendor/` (no CDN
  dependency). Product photography lives under `images/products/` and is
  committed into the repo (no external image host), so the whole site works
  fully offline.

## Run locally

```bash
cd stride
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
stride/
├── index.html              # markup + content (hero, sections, CTA)
├── css/style.css            # design system: colors, type scale, layout
├── js/main.js               # preloader, one-shot scroll reveals, focus blur
└── images/products/         # product photography (6 pieces) for the Collection
```

## Customizing

- Swap the six products in the `.product-list` section of `index.html` —
  each `.product-feature` needs a `data-category` (matching one of the
  `.filter-tab` `data-filter` values), an `<img class="product-feature__img">`
  pointing at a photo under `images/products/`, and a
  `.product-feature__badge` label.
- Colors and type live in the `:root` variables at the top of `css/style.css`
  (`--bg`, `--fg`, `--accent`, `--accent-deep`).
- Replace the mailto CTA and social links in the `#contact` section and footer.
