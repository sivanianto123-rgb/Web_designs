# Freightline — Logistics Freight Site

A small multi-page logistics/freight marketing site, "Freightline."
The homepage opens on a full-viewport pixel-exact hero (an aerial
freight-train video, headline copy and two feature blocks mirrored
across the train's center axis, with a single ~1.8s entrance
animation), then **scrolls into a GSAP-driven "story"**: a scroll
progress bar, staggered phrase reveals, scroll-scrubbed stat counters,
a pinned horizontal-scroll services gallery, a scrubbed video zoom, an
infinite marquee ticker, a custom cursor, a chapter progress HUD, and
hover-tilt/magnetic micro-interactions — before handing off to a
handful of supporting pages and two working front-end flows.

## Pages

- **`index.html`** — the hero (first viewport, pixel-exact, unchanged
  geometry) followed by a scrollable, GSAP-driven story (see "Motion"
  below for the full list of effects). A standard
  transparent-until-scrolled nav sits on top of all of it so the hero
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

## Motion

Two layers, split by page:

**Interior pages** (`services.html`, `about.html`, `contact.html`,
`track.html`, `quote.html`) use a small vanilla engine in
`assets/site.js`:

- **`data-reveal`** (optionally `="fade"`, `="left"` or `="right"`) —
  fades/slides an element in the first time it scrolls into view, via
  `IntersectionObserver`. Add `data-reveal-group` to a parent to
  stagger its direct `data-reveal` children.
- **`data-parallax="0.15"`** — scroll-linked `translate3d` drift at
  the given speed, via an `requestAnimationFrame`-throttled scroll
  listener.

**The homepage** (`index.html`) loads GSAP + ScrollTrigger (vendored
locally under `assets/vendor/`, same files the sibling `stride/`
project uses — no CDN) and a dedicated `assets/motion.js` that
replaces the vanilla engine with a richer set of effects, on **native
scroll** — no Lenis. It was there originally; removed after a real,
confirmed bug: Lenis drives scroll via its own continuously-animated,
eased position, which fights native CSS scroll-snap (used below) for
control of where scroll comes to rest. The sibling `stride/` project
hit the identical combination (Lenis + scroll-snap) independently,
confirmed it as resistance/stutter and, with `mandatory` snapping, a
gesture that could get stuck short of the next boundary — and removed
Lenis for the same reason. GSAP ScrollTrigger needs no scroll library
to function, so nothing else changed.

- **Scroll progress bar** (`.scroll-progress`, fixed top) — a 4-color
  gradient bar that fills left-to-right as you scroll the page,
  driven by `scrollTrigger: { start:'top top', end:'max', scrub:true }`.
- **Staggered phrase reveal** — the homepage statement is split into
  `.reveal-word` phrase spans (masked via `overflow:hidden`) that
  slide up with a stagger as the section enters view.
- **Scroll-scrubbed stat counters** — `.stat__num[data-count-to]`
  elements count up from 0 to their target (with configurable
  `data-count-prefix` / `-suffix` / `-decimals`) the first time they
  scroll into view.
- **Pinned horizontal-scroll services gallery** (`.hcards-pin` /
  `.hcards-viewport` / `.hcards-track`, desktop only via
  `gsap.matchMedia('(min-width: 861px)')`) — the section pins for
  extra scroll distance while all 6 service cards slide horizontally
  underneath the (non-scrolling) heading. Falls back to the normal
  stacked/2-col grid below 861px — horizontal pin-scroll is a poor fit
  for touch scrolling.
- **Scrubbed video zoom** — the mid-page video band's `<video>` scales
  from 1.18× down to 1× as the section scrolls through (`scrub:true`),
  a cinematic "settle" effect replacing the earlier linear parallax.
- **Infinite marquee ticker** (`.marquee`) — a looping CSS animation
  (not GSAP) listing all 6 service lines between sections, for motion
  even when the user isn't actively scrolling.
- **Card tilt-on-hover** (`.tilt` wrapping `.tilt-el`, `pointer:fine`
  only) — a subtle 3D rotate following the cursor position, reset on
  mouse-leave. Note `perspective` must live on the wrapper, not the
  rotated element itself — hence the two-element pattern.
- **Magnetic buttons** (`.magnetic`, `pointer:fine` only) — the final
  CTA buttons nudge toward the cursor within their own bounds, via
  GSAP's `elastic.out` ease on release.
- **Hero-exit depth transition** — as the user scrolls from the hero
  into the story, the hero's own background video scales to 1.12×
  (`.bg`, GPU-accelerated `transform` only) while `.stage` fades to 0
  opacity, both scrubbed to the scroll position over the hero's own
  height. `.stage` is faded via opacity rather than scaled, since it
  already carries a static CSS `transform:scale(var(--s))` for its
  pixel-exact layout that a GSAP-driven inline transform would
  otherwise silently overwrite.
- **Scroll-snap** (homepage only, `html{scroll-snap-type:y proximity}`
  + `scroll-snap-align:start` on the hero and each top-level section)
  — proximity, not mandatory, so it settles on a section boundary only
  when the scroll was already coming to rest near one, rather than
  forcing every scroll to stop at a boundary. Deliberately excludes
  `.hcards-pin`: snapping into a section GSAP is also pinning/scrubbing
  would fight it. Also deliberately scoped to this page only — the
  interior pages (a contact form, the quote wizard's variable-height
  steps, a tracking result of unpredictable length) are exactly the
  kind of "information-dense, varied content height" case where
  mandatory-style snapping hurts more than it helps.
- **Custom cursor** (`.cursor`/`.cursor__label`, `pointer:fine` only)
  — a small dot that lerps toward the real cursor position each frame
  (`curX += (mouseX - curX) * 0.2`, not GSAP-driven — matching the
  sibling `stride/` project's implementation, adapted to this site's
  orange/lavender palette) and grows into a filled circle with a text
  label (`data-cursor="…"`) over cards and buttons. The system cursor
  is hidden only once the JS actually runs (`body.has-custom-cursor`),
  so a reduced-motion visitor or a failed script load never ends up
  with no cursor at all.
- **Chapter HUD** (`.chapter-hud`, bottom-left, hidden below 620px) —
  a small "02 · The Fix"-style indicator tracking which of the
  homepage's 6 story chapters (`data-chapter-index`/`-name` on each
  top-level section) is in view, via `IntersectionObserver`. Only
  visible while a chapter section is actually on screen, so it never
  sits on top of the hero or the closing CTA/footer.

Every one of these is skipped under `prefers-reduced-motion: reduce`:
`motion.js` short-circuits into a block that sets every element to its
final, fully-visible state (words shown, counters at their target
value, track untransformed, hero fully visible) with no scroll-snap,
no cursor/HUD, and no scrub/pin/tilt/magnetic behavior at all.
`site.js` carries a second, independent fallback for the rare case the
GSAP vendor script itself fails to load (so counters and revealed text
never get stuck at their initial "0"/hidden state).

### Performance

Three real, measured fixes worth knowing about if the page ever feels
sluggish again:

- **No Lenis** (see above) — removing it also removes one more
  continuously-running `requestAnimationFrame` loop fighting for the
  same frame budget as everything else below.
- **Throttled nav scroll handler** (`assets/site.js`) — the
  transparent→solid nav toggle used to run on every native `scroll`
  event, which fires far more often than the screen repaints; toggling
  a class (and the style recalc that goes with it) that often is a
  real, measurable source of jank. Now `requestAnimationFrame`-gated,
  like the rest of this site's scroll handlers already were.
- **Videos pause when off-screen** (`assets/site.js`, all pages) — a
  playing `<video>` decodes every frame whether visible or not. With
  up to two full-bleed background clips on the homepage alone (plus
  whatever GSAP is scrubbing on top during scroll), that's real,
  ongoing decode cost for video nobody can see. An `IntersectionObserver`
  (`200px` root margin) now pauses each background video the moment it
  leaves the viewport and resumes it on return; `autoplay` still
  starts them normally on first load.

**Deliberately not used**: infinite scroll and multi-directional
(2D) scrolling. Both are poor fits for this site by the same kind of
evidence this motion system otherwise leans on — infinite scroll
(per Nielsen Norman Group) suits homogeneous discovery feeds, not the
goal-directed flows here (getting a quote, tracking a shipment, in a
forms-and-results-based site where losing your scroll position and
footer access is a real cost); multi-directional scrolling fights
WCAG 2.1's requirement that content stay usable without 2D scrolling
at 400% zoom, and fits "portfolio/showcase" content better than a
forms-and-flows logistics site. Both patterns remain a reasonable fit
for other projects — just not this one.

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

A two-hue theme — **orange** and **lavender** — all defined in
`assets/site.css`: `--accent` (`#F97316`, primary orange) and
`--accent-2` (`#A78BFA`, lavender) are the two dominant colors;
`--accent-3` (`#FDBA74`, a lighter orange tint) and `--accent-4`
(`#C4B5FD`, a lighter lavender tint) round out a 4-step cycle so
repeated elements (6 service-card icons, 4 stat underlines) alternate
shades within the same two hue families instead of repeating one color
or reintroducing unrelated ones.

The base itself is deliberately **not** neutral black/gray: `--bg`
(`#180f1e`) is a deep plum, and `--bg-alt` (`#20150e`, used for
alternating section backgrounds) is a deep warm umber — a cool/warm
pair in the same two hue families as the accents, so even the areas
between gradient highlights carry color identity instead of reading
as flat black with colored confetti on top. The ambient `--mesh`
gradient (four corner-anchored radial blobs, one per accent) sits
behind every section via `.bg-mesh-fixed`.

The color isn't only skin-deep on top of video, and it isn't done with
`background-attachment:fixed` either — that property is well known to
fail outright on iOS Safari and to cause scroll jank on desktop (see
CSS-Tricks' writeup on the subject). Instead, `.bg-mesh-fixed` is a
real `position:fixed; inset:0; z-index:-1` element (added once near
the top of every page's `<body>`) painting the `--mesh` gradient
behind all scrollable content — the technique those sources recommend
in its place. `body` itself only needs a plain `background:var(--bg)`
now. Every section that also paints its own opaque fill
(`.page-hero`, `.video-band`, `.story-section--dark`,
`.story-section--alt`, `.footer`) layers `--mesh` again on top of its
own base color, so even with **no video loaded at all**, every page
still reads as a colorful gradient wash, never flat black — verified
by testing with the video network request blocked entirely. Each
`<video>` also carries an inline SVG `poster` (a small data URI, no
network request) built from the same four colors, so the video's own
box never paints black before a frame arrives or if it fails to load.

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
├── index.html        # hero (first viewport) + GSAP-driven story sections
├── services.html      # service lines
├── about.html           # company story, stats, timeline
├── contact.html          # contact form flow
├── track.html              # shipment tracking flow
├── quote.html                # get-a-quote wizard flow
└── assets/
    ├── site.css              # shared design system + motion utilities
    ├── site.js                # shared nav/footer, reveal/parallax fallback,
    │                          #   nav-scroll throttle, off-screen video pause
    ├── motion.js                # homepage-only: ScrollTrigger orchestration,
    │                            #   custom cursor, chapter HUD
    └── vendor/
        ├── gsap.min.js             # vendored locally, no CDN
        └── ScrollTrigger.min.js
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
