# Freightline — Logistics Freight Site

A small multi-page logistics/freight marketing site, "Freightline."
The homepage opens on a full-viewport pixel-exact hero (an aerial
freight-train video, headline copy and two feature blocks mirrored
across the train's center axis, with a single ~1.8s entrance
animation), then **scrolls into a narrative "story"**: parallax,
scroll-triggered reveals, a second full-bleed video section, service
highlights and stats, before handing off to a handful of supporting
pages and two working front-end flows.

## Pages

- **`index.html`** — the hero (first viewport, pixel-exact, unchanged
  geometry) followed by a scrollable story: a statement section, two
  alternating feature spreads, a full-bleed video band with a
  parallax-scrolled video layer, a services preview, a stats band and
  a closing CTA. A standard transparent-until-scrolled nav now sits on
  top of all of it (replacing the earlier corner menu) so the hero
  stays reachable mid-scroll.
- **`services.html`** — the six service lines (ocean, air, rail,
  trucking, customs, warehousing) as cards, each in a different accent
  color; each links into the quote flow with its mode pre-selected.
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

## Motion: parallax + scroll reveals

A small shared engine in `assets/site.js` (also used inline on the
homepage) powers two attributes used across every page:

- **`data-reveal`** (optionally `="fade"`, `="left"` or `="right"`) —
  fades/slides an element in the first time it scrolls into view, via
  `IntersectionObserver`. Add `data-reveal-group` to a parent to
  stagger its direct `data-reveal` children.
- **`data-parallax="0.15"`** — scroll-linked `translate3d` drift at
  the given speed, updated on an `requestAnimationFrame`-throttled
  scroll listener. Used on the homepage's mid-page video layer.

Both are skipped entirely under `prefers-reduced-motion: reduce`
(reveals render already-visible, parallax elements get no transform).

## Real video, reused across the site

The only real video asset available is the CloudFront aerial
freight-train clip used in the original hero. Rather than fall back to
static art everywhere else, it's reused — at reduced opacity, behind a
color-graded tint — as a background layer on the homepage's mid-page
video band and on every interior page's top `.page-hero` band
(`services.html`, `about.html`, `contact.html`, `track.html`,
`quote.html`), so motion carries through the whole site, not just the
homepage. Swapping in additional footage (e.g. ocean, warehouse,
trucking clips) only requires dropping files under `assets/video/` and
pointing the relevant `<video src>` at them — see Customizing below.

## Color palette

Beyond the near-black base and cream/white type, the site uses three
secondary accents next to the original rust (`--accent`):
teal (`--accent-2`), amber (`--accent-3`) and steel-blue
(`--accent-4`) — all defined in `assets/site.css`. They cycle across
service-card icons and stat underlines, tint the ambient gradients
behind page-hero bands and the video band, and give "done" states
(timeline, stepper) a distinct color from "active" states, so the site
reads as more than a monochrome dark theme.

## Stack

- No build step — plain HTML/CSS/JS, open any page directly or serve
  the folder.
- `index.html`'s hero markup/CSS stays inline as originally built; its
  new story sections below the hero use the shared `assets/site.css`
  classes, same as the other five pages.
- The five interior pages plus the homepage's story sections share
  `assets/site.css` (design tokens, nav, footer, cards, forms,
  stepper, timeline, parallax/reveal utilities) and `assets/site.js`
  (mobile nav toggle, scroll-solid nav, active-link highlighting,
  footer year, the reveal/parallax engine).
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
├── index.html        # hero (first viewport) + scrollable story sections
├── services.html      # service lines
├── about.html           # company story, stats, timeline
├── contact.html          # contact form flow
├── track.html              # shipment tracking flow
├── quote.html                # get-a-quote wizard flow
└── assets/
    ├── site.css              # shared design system + parallax/reveal utilities
    └── site.js               # shared nav/footer/scroll-reveal/parallax behavior
```

## Layout (hero, first viewport)

- **Desktop / landscape**: a 1280×800 "stage" is centered and scaled
  to fit the viewport (`--s: min(100vh/800, 100vw/716)`), with every
  element pixel-positioned and mirrored across the train's center
  axis.
- **Tablet portrait** (`min-width:610px` and `max-aspect-ratio:1/1`):
  reflows into a CSS grid with a center "rail" column, features placed
  side by side on either side of the rail. Top padding accounts for
  the fixed nav height (`var(--nav-h)`) so content clears it.
- **Phone** (`max-width:609px`): single-column grid; the two feature
  blocks stay mirrored (one right-aligned, one left-aligned) rather
  than both being centered. Same nav-height-aware top padding as
  tablet.

## Customizing

- Swap the background video by changing the `src` on every `.bg`,
  `.page-hero__video` and `.video-band__media` element, plus the
  `href` on the `<link rel="preload">` in `index.html` — keep them in
  sync, or point different sections at different clips once more
  footage is available (e.g. ocean footage on `services.html`'s hero,
  a warehouse clip on the homepage's video band).
- Brand tokens (`--bg`, `--cream`, `--white`, `--ink`, `--accent`,
  `--accent-2/3/4`) are defined in `assets/site.css` for the interior
  pages and duplicated in `index.html`'s own `<style>` for the hero —
  update both to re-skin the whole site.
- Entrance animation timing/easing for the hero is defined in the
  `@media (prefers-reduced-motion:no-preference)` block near the
  bottom of `index.html`'s `<style>`; the story-section
  parallax/reveal speeds are controlled via each element's
  `data-parallax` value and the transition durations on `[data-reveal]`
  in `assets/site.css`. Both motion systems are skipped entirely when
  the user prefers reduced motion.
- The track flow's simulated data (cities, modes, step copy) lives in
  the `<script>` at the bottom of `track.html`; the quote flow's
  steps/fields live in `quote.html`'s markup plus its own `<script>`.
