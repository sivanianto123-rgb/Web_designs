# Freightline — Logistics Freight Site

A small multi-page logistics/freight marketing site, "Freightline."
The homepage is a full-viewport, overflow-hidden hero: an aerial
freight-train video fills the screen, with headline copy and two
feature blocks composed on the train's vertical center axis and
mirrored across it, and a single ~1.8s entrance animation. From there
it links out to a handful of supporting pages and two working
front-end flows.

## Pages

- **`index.html`** — the hero homepage described above. Unchanged
  from the original pixel-exact build, plus one addition: a small
  fixed corner button (top-right) that opens a full-screen overlay
  menu linking to the rest of the site. The button/panel are
  positioned independently of the hero's `.stage`, so they don't
  affect its layout, scaling, or "no scroll" behavior.
- **`services.html`** — the six service lines (ocean, air, rail,
  trucking, customs, warehousing) as cards; each links into the quote
  flow with its mode pre-selected.
- **`about.html`** — company story, values, stats, and a milestone
  timeline.
- **`contact.html`** — a contact form with client-side validation and
  an inline success state, plus office/phone/hours info.
- **`track.html`** — **shipment tracking flow.** Enter any tracking
  number (or use one of the example buttons) to see a simulated
  shipment summary and a 6-step checkpoint timeline. Results are
  deterministic per tracking number (hashed client-side), not random,
  so the same input always reproduces the same shipment.
- **`quote.html`** — **get-a-quote flow.** A 4-step wizard (Shipment →
  Cargo → Contact → Review) with a progress stepper, per-step
  validation, a review summary built from the entered data, and a
  submit step that shows a generated reference number. Reads
  `?mode=ocean|air|rail|trucking` from the URL to pre-select the
  shipping mode when arriving from a services card.

Both flows are entirely client-side — nothing is transmitted or
stored; they exist to demonstrate the interaction, not to back a real
quoting/tracking system.

## Stack

- No build step — plain HTML/CSS/JS, open any page directly or serve
  the folder.
- `index.html` stays a single standalone file (inline CSS/JS, no
  external assets besides the background video) as originally built.
- The other five pages share `assets/site.css` (design tokens, nav,
  footer, cards, forms, stepper, timeline) and `assets/site.js`
  (mobile nav toggle, active-link highlighting, footer year).
- Same two `@font-face` families (`Display`, `UI`) as the hero,
  resolved via `local()` to installed condensed grotesques — no font
  files or CDNs anywhere in the site.

## Run locally

```bash
cd logistics-freight-hero
python3 -m http.server 8000
# open http://localhost:8000
```

Or open `index.html` directly in a browser (the interior pages also
work fine opened directly via `file://`).

## Structure

```
logistics-freight-hero/
├── index.html        # hero homepage (standalone) + corner menu
├── services.html      # service lines
├── about.html          # company story, stats, timeline
├── contact.html         # contact form flow
├── track.html            # shipment tracking flow
├── quote.html              # get-a-quote wizard flow
└── assets/
    ├── site.css          # shared design system for the 5 interior pages
    └── site.js           # shared nav/footer behavior
```

## Layout (hero)

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
  `href` on the `<link rel="preload">` in `index.html` — keep both in
  sync.
- Brand tokens (`--bg`, `--cream`, `--white`, `--ink`, `--accent`) are
  defined in `assets/site.css` for the interior pages and duplicated
  in `index.html`'s own `<style>` for the hero — update both to
  re-skin the whole site.
- Entrance animation timing/easing for the hero is defined in the
  `@media (prefers-reduced-motion:no-preference)` block near the
  bottom of `index.html`'s `<style>` — it's skipped entirely when the
  user prefers reduced motion.
- The track flow's simulated data (cities, modes, step copy) lives in
  the `<script>` at the bottom of `track.html`; the quote flow's
  steps/fields live in `quote.html`'s markup plus its own `<script>`.
