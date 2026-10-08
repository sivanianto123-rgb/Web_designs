# STRIDE — Never Stand Still

A fictional brand concept blending Nike's bold athletic performance energy
with Fastrack's youthful, street-edged attitude. Built as a standard
single-page site: normal vertical scroll, sections stack top-to-bottom,
with simple fade/slide-in reveals as you scroll into them. No pinned
sections, no scroll-jacked carousels, no scroll-snap — earlier versions of
this site tried that and it didn't land well, so it was deliberately
stripped back out.

## Sections

1. **Hero** — "Built to move," with a CTA into the Collection.
2. **Origin** — a short manifesto.
3. **By The Numbers** — stat counters that count up once when you scroll
   to them (not tied continuously to scroll position — they animate to
   their target over ~1.4s and stop).
4. **The Collection** — the six-piece product grid, filterable by category
   (All Gear / Footwear / Wearables / Accessories). Each card carries a
   category badge, an arrow button, and an orange overlay that rises over
   the image on hover ("View Product"). As you scroll past the grid, each
   card drifts vertically at its own rate — an asynchronous parallax, not
   a uniform reveal — scrubbed to scroll position but never pinning the
   page.
5. **Worn By The City** — an infinite city-name marquee and quote cards.
6. **Join the Movement** — closing CTA.

## Theme

Orange (`--accent` / `--accent-deep`) and white/off-white (`--bg` /
`--bg-soft`), with near-black text. No other hues — product card backdrops
use warm gradient variants (amber, deep orange, rust) to stay within the
same family instead of introducing new colors.

## Stack

- No build step — static HTML/CSS/JS, open `index.html` directly or serve it.
- [GSAP](https://gsap.com/) + ScrollTrigger for two things: one-shot
  reveals (`.reveal-up` elements, product cards, and the stat counters
  fade/animate in once as they're scrolled to, `once: true`), and the
  Collection grid's asynchronous card parallax (`scrub: true`, offset
  varies by column — a continuous transform tied to scroll position, but
  on elements already in normal document flow, so nothing is pinned and
  the page scrolls completely natively).
- Scrolling is fully native — no smooth-scroll library, no CSS scroll-snap.
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
├── js/main.js               # preloader, cursor, one-shot scroll reveals
└── images/products/         # product photography (6 pieces) for the Collection grid
```

## Customizing

- Swap the six products in the `.grid` section of `index.html` — each
  `.card` needs a `data-category` (matching one of the `.filter-tab`
  `data-filter` values), an `<img class="card__icon">` pointing at a photo
  under `images/products/`, and a `.card__badge` label.
- Colors and type live in the `:root` variables at the top of `css/style.css`
  (`--bg`, `--fg`, `--accent`, `--accent-deep`).
- Replace the mailto CTA and social links in the `#contact` section and footer.
