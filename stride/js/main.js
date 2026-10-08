// STRIDE — Never Stand Still
// Preloader, custom cursor, and simple scroll-triggered reveals.
// Normal native scrolling throughout — no pinning, no scroll-jacking,
// no scroll-snap. Sections just fade/slide in once as they enter view.

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  initPreloader(() => {
    if (hasFinePointer && !reduceMotion) initCursor();
    initNav();
    initMarquees();
    initMagneticButton();

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      initRevealAnimations();
      initNumbersCount();
    } else {
      // Fallback: just show everything if GSAP failed to load.
      document.querySelectorAll(".reveal-up, .hero__title .word, .cta__title .word").forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = "none";
      });
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

/* ---------------- Custom cursor ---------------- */
function initCursor() {
  const cursor = document.getElementById("cursor");
  const label = document.getElementById("cursorLabel");
  if (!cursor || !label) return;

  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function render() {
    curX += (mouseX - curX) * 0.18;
    curY += (mouseY - curY) * 0.18;
    cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  }
  render();

  const hoverTargets = document.querySelectorAll("[data-cursor], .card, a, button");
  hoverTargets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      const text = el.getAttribute("data-cursor") || "";
      label.textContent = text;
      cursor.classList.add("is-hovering");
    });
    el.addEventListener("mouseleave", () => {
      label.textContent = "";
      cursor.classList.remove("is-hovering");
    });
  });
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

  // Product cards: staggered fade/scale in once as they enter view.
  gsap.utils.toArray(".card").forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 92%",
        once: true,
      },
      delay: (i % 3) * 0.08,
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
