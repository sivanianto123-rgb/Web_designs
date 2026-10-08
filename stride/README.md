# STRIDE — Never Stand Still

A fictional brand concept blending Nike's bold athletic performance energy
with Fastrack's youthful, street-edged attitude. The site is built as a
scroll-driven story rather than a static showcase — six chapters, told
entirely through motion.

## The story

1. **Hero** — kinetic intro, "Built to move."
2. **Chapter 01 — Origin** — a manifesto that lights up word-by-word as you
   scroll, with a pulse line that draws itself in sync with scroll position.
3. **Chapter 02 — The Drop** — a horizontal, scroll-jacked product carousel
   (pin + scrub): four products slide past as you scroll down.
4. **Chapter 03 — By The Numbers** — stat counters tied directly to scroll
   progress, not time — they tick as you scroll, not on a timer.
5. **Chapter 04 — The Collection** — the full six-piece product grid.
6. **Chapter 05 — Worn By The City** — an infinite city-name marquee and
   quote cards.
7. **Join the Movement** — closing CTA.

Each numbered chapter opens with a big ghost numeral + eyebrow label
("01 Origin", "02 The Drop"...), set against a solid, saturated color-block
background — no two adjacent chapters share a color. A pair of fixed
film-strip tick-mark rails run down the left/right edges of the viewport,
and the nav shows a live pill (current chapter number + name) that fades in
once you've scrolled into the story. A top progress bar tracks overall
scroll position.

Each chapter uses CSS Scroll Snap (`scroll-snap-type: y proximity`) to
settle into place like a full-screen slide — chosen over `mandatory` because
`mandatory` can trap a gentle scroll gesture before it reaches the next
section (tested: small wheel ticks got stuck oscillating short of the
boundary). The Drop carousel is deliberately excluded from snapping since
it's already its own pinned, scroll-jacked interaction.

## Stack

- No build step — static HTML/CSS/JS, open `index.html` directly or serve it.
- [GSAP](https://gsap.com/) + ScrollTrigger for the scroll-scrubbed
  storytelling: pinned sections, the horizontal carousel, manifesto color
  reveal, pulse-line draw, and scrubbed counters.
- Scrolling is native (no smooth-scroll library) — a prior Lenis integration
  was removed because its eased, continuously-animated scroll position
  actively fought CSS scroll-snap, preventing it from ever settling past a
  section boundary.
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
├── index.html              # markup + content (hero, 6 chapters, CTA)
├── css/style.css            # design system: colors, type scale, layout, chapter styles
├── js/main.js               # preloader, cursor, chapter HUD, scroll-scrubbed story logic
└── images/products/         # product photography (6 pieces), used in both the
                              # Collection grid and the Drop carousel
```

## Customizing

- Swap the six products in the `.grid` section of `index.html` — each
  `.card` needs an `<img class="card__icon">` pointing at a photo under
  `images/products/`, plus a title/category, and picks up a blue or orange
  backdrop automatically from its `card__visual--0N` class in `css/style.css`.
- The horizontal carousel panels live in `#dropTrack` — add/remove
  `.chapter-drop__panel` articles and `initDropCarousel()` in `js/main.js`
  adapts automatically.
- Colors and type live in the `:root` variables at the top of `css/style.css`
  (`--bg`, `--fg`, `--accent`, `--accent2`).
- Replace the mailto CTA and social links in the `#contact` section and footer.
