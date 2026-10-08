// STRIDE — Never Stand Still
// Preloader and simple scroll-triggered reveals. Normal native scrolling
// throughout — no pinning, no scroll-jacking, no scroll-snap. Sections
// just fade/slide in once as they enter view. The product cursor is the
// regular system cursor; there's no custom cursor dot.
// The Collection shows one product at a time (not a grid): each panel
// sharpens into focus near the center of the viewport and blurs out
// toward the edges as you scroll past it.
// The Origin section is the one deliberate exception to "no pinning":
// it's a pinned, crossfading scene-by-scene story (desktop + motion only
// — see initStory), matching a reference the user asked to be matched.

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initPreloader(() => {
    initNav();
    initMarquees();
    initMagneticButton();
    initFilterTabs();

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      initRevealAnimations();
      initNumbersCount();
      initStory(reduceMotion);
      if (!reduceMotion) initProductFocusBlur();
    } else {
      // Fallback: just show everything if GSAP failed to load.
      document.querySelectorAll(".reveal-up, .hero__title .word, .cta__title .word").forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = "none";
      });
      const story = document.querySelector(".story");
      if (story) story.classList.add("story--static");
    }
  });
});

/* ---------------- Preloader ---------------- */
function initPreloader(done) {
  const preloader = document.getElementById("preloader");
  const countEl = document.getElementById("preloaderCount");
  if (!preloader || !countEl) return done();

  let progress = 0;
  const finish = () => {
    preloader.style.transition = "opacity 0.6s ease, visibility 0.6s ease";
    preloader.style.opacity = "0";
    preloader.style.visibility = "hidden";
    document.body.style.overflow = "";
    done();
  };

  document.body.style.overflow = "hidden";

  const tick = () => {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) {
      progress = 100;
      countEl.textContent = "100";
      setTimeout(finish, 350);
      return;
    }
    countEl.textContent = String(Math.floor(progress));
    setTimeout(tick, 120);
  };
  tick();
}

/* ---------------- Nav / mobile menu ---------------- */
function initNav() {
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobileMenu");
  if (!burger || !menu) return;
  burger.addEventListener("click", () => menu.classList.toggle("is-open"));
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => menu.classList.remove("is-open"))
  );
}

/* ---------------- Marquees pause on hover ---------------- */
function initMarquees() {
  document.querySelectorAll(".hero__marquee-track, .strip__track, .city-marquee__track").forEach((track) => {
    track.parentElement.addEventListener("mouseenter", () => (track.style.animationPlayState = "paused"));
    track.parentElement.addEventListener("mouseleave", () => (track.style.animationPlayState = "running"));
  });
}

/* ---------------- Magnetic CTA button ---------------- */
function initMagneticButton() {
  const btn = document.querySelector(".magnetic-btn");
  if (!btn || !window.matchMedia("(hover: hover)").matches) return;

  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${relX * 0.3}px, ${relY * 0.3}px)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translate(0, 0)";
  });
}

/* ---------------- Scroll-triggered reveals (fade/slide in once, no pin/scrub) ---------------- */
function initRevealAnimations() {
  // Split-line hero / CTA headline reveal, plays once on load.
  gsap.to(".hero__title .word, .cta__title .word", {
    y: 0,
    duration: 1.1,
    ease: "power4.out",
    stagger: 0.08,
    delay: 0.1,
  });

  // Generic fade-up elements, each plays once as it enters the viewport.
  document.querySelectorAll(".reveal-up").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
    });
  });

  // Product panels: fade/scale in once as each enters view.
  gsap.utils.toArray(".product-feature").forEach((panel) => {
    gsap.from(panel, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: panel,
        start: "top 92%",
        once: true,
      },
    });
  });
}

/* ---------------- Stat counters: count up once when the section is reached ---------------- */
function initNumbersCount() {
  const section = document.querySelector(".chapter-numbers");
  const nums = document.querySelectorAll(".num-block__num");
  if (!section || !nums.length) return;

  ScrollTrigger.create({
    trigger: section,
    start: "top 75%",
    once: true,
    onEnter: () => {
      nums.forEach((el) => {
        const target = parseFloat(el.getAttribute("data-target"));
        const decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
        gsap.fromTo(
          el,
          { textContent: 0 },
          {
            textContent: target,
            duration: 1.4,
            ease: "power2.out",
            snap: { textContent: decimals > 0 ? 1 / Math.pow(10, decimals) : 1 },
            onUpdate: function () {
              el.textContent = Number(this.targets()[0].textContent).toFixed(decimals);
            },
          }
        );
      });
    },
  });
}

/* ---------------- Collection: filter tabs ---------------- */
function initFilterTabs() {
  const tabs = document.querySelectorAll(".filter-tab");
  const panels = document.querySelectorAll(".product-feature");
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      const filter = tab.getAttribute("data-filter");
      panels.forEach((panel) => {
        const match = filter === "all" || panel.getAttribute("data-category") === filter;
        panel.classList.toggle("is-filtered-out", !match);
      });

      // Panel positions changed, so scroll-tied triggers need their
      // measurements refreshed.
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
}

/* ---------------- Origin: pinned, crossfading story ---------------- */
// The section is 4x viewport height. A single ScrollTrigger pins
// .story__viewport for that entire range; as the user scrolls through it,
// onUpdate works out which quarter of the range they're in and toggles
// .is-active on the matching scene (CSS opacity transition does the
// crossfade). This is the one section on the site that pins — skipped
// entirely on narrow viewports or reduced-motion, where CSS instead lays
// the scenes out as normal stacked blocks (see .story--static).
function initStory(reduceMotion) {
  const section = document.querySelector(".story");
  if (!section) return;

  const isWideEnough = window.matchMedia("(min-width: 861px)").matches;
  if (!isWideEnough || reduceMotion) {
    section.classList.add("story--static");
    return;
  }

  const scenes = gsap.utils.toArray(".story__scene");
  const dots = gsap.utils.toArray(".story__progress-dot");
  if (!scenes.length) return;

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    pin: ".story__viewport",
    onUpdate: (self) => {
      const index = Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length));
      scenes.forEach((scene, i) => scene.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    },
  });
}

/* ---------------- Collection: scroll-focus blur per product ---------------- */
// Each product panel sharpens into focus as it nears the center of the
// viewport and blurs out toward the edges — filter is driven directly by
// scroll position (scrub: true), the same idea as Framer Motion's
// useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(10px)"]),
// just read off GSAP ScrollTrigger's own progress instead of a React hook.
// It's a filter on an element already in normal flow: nothing is pinned,
// scrolling stays fully native.
function initProductFocusBlur() {
  const panels = gsap.utils.toArray(".product-feature");
  if (!panels.length) return;

  panels.forEach((panel) => {
    ScrollTrigger.create({
      trigger: panel,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const distanceFromCenter = Math.abs(self.progress - 0.5) * 2; // 0 centered -> 1 at edges
        panel.style.filter = `blur(${(distanceFromCenter * 10).toFixed(1)}px)`;
      },
    });
  });
}
