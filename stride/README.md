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

A fixed chapter HUD (bottom-left) and a top progress bar track where you are
in the story as you scroll.

## Stack

- No build step — static HTML/CSS/JS, open `index.html` directly or serve it.
- [GSAP](https://gsap.com/) + ScrollTrigger for the scroll-scrubbed
  storytelling: pinned sections, the horizontal carousel, manifesto color
  reveal, pulse-line draw, and scrubbed counters.
- [Lenis](https://github.com/darkroomengineering/lenis) for buttery smooth
  scrolling.
- GSAP, ScrollTrigger and Lenis are vendored locally under `js/vendor/` (no
  CDN dependency), and all product "photography" is inline SVG + CSS
  gradients, so the whole site works fully offline.

## Run locally

```bash
cd stride
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
stride/
├── index.html       # markup + content (hero, 6 chapters, CTA)
├── css/style.css     # design system: colors, type scale, layout, chapter styles
└── js/main.js        # preloader, cursor, smooth scroll, chapter HUD, scroll-scrubbed story logic
```

## Customizing

- Swap the six placeholder products in the `.grid` section of `index.html`
  — each `.card` just needs an SVG icon, title, category and a `card__visual--0N`
  gradient class in `css/style.css`.
- The horizontal carousel panels live in `#dropTrack` — add/remove
  `.chapter-drop__panel` articles and `initDropCarousel()` in `js/main.js`
  adapts automatically.
- Colors and type live in the `:root` variables at the top of `css/style.css`
  (`--bg`, `--fg`, `--accent`, `--accent2`).
- Replace the mailto CTA and social links in the `#contact` section and footer.
