// STRIDE — Never Stand Still
// Preloader, custom cursor, chapter HUD, and the scroll-driven story:
// manifesto reveal, pulse line draw, horizontal product carousel, and
// scrubbed stat counters. Scrolling is native (CSS scroll-snap locks
// each chapter into place) so it isn't fought by a JS smooth-scroll lib.

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  initPreloader(() => {
    if (hasFinePointer && !reduceMotion) initCursor();
    initNav();
    initMarquees();
    initMagneticButton();
    initProgressBar();
    initChapterHud();

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      initRevealAnimations();
      initManifesto();
      initPulseLine();
      initDropCarousel();
      initNumbersScrub();
    } else {
      // Fallback: just show everything if GSAP failed to load.
      document.querySelectorAll(".reveal-up, .word, .manifesto .word").forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = "none";
        el.style.color = "";
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

/* ---------------- Scroll progress bar ---------------- */
function initProgressBar() {
  const bar = document.getElementById("progressBar");
  if (!bar) return;
  const update = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = pct + "%";
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/* ---------------- Chapter HUD ---------------- */
function initChapterHud() {
  const hud = document.getElementById("chapterHud");
  const indexEl = document.getElementById("chapterHudIndex");
  const nameEl = document.getElementById("chapterHudName");
  const chapters = document.querySelectorAll("[data-chapter-index]");
  if (!hud || !chapters.length) return;

  const first = chapters[0];
  const last = chapters[chapters.length - 1];

  // Only show the HUD while a chapter is actually on screen, so it never
  // sits on top of the hero or the closing CTA/footer.
  const toggleVisible = () => {
    const firstTop = first.getBoundingClientRect().top + window.scrollY;
    const lastBottom = last.getBoundingClientRect().bottom + window.scrollY;
    const probe = window.scrollY + window.innerHeight * 0.5;
    if (probe > firstTop && probe < lastBottom) hud.classList.add("is-visible");
    else hud.classList.remove("is-visible");
  };
  toggleVisible();
  window.addEventListener("scroll", toggleVisible, { passive: true });
  window.addEventListener("resize", toggleVisible);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          indexEl.textContent = entry.target.getAttribute("data-chapter-index");
          nameEl.textContent = entry.target.getAttribute("data-chapter-name");
        }
      });
    },
    { threshold: 0.5 }
  );
  chapters.forEach((c) => observer.observe(c));
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

/* ---------------- Scroll-triggered reveals ---------------- */
function initRevealAnimations() {
  // Split-line hero / CTA headline reveal
  gsap.to(".hero__title .word, .cta__title .word", {
    y: 0,
    duration: 1.1,
    ease: "power4.out",
    stagger: 0.08,
    delay: 0.1,
  });

  // Generic fade-up elements, triggered on scroll
  document.querySelectorAll(".reveal-up").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
      },
    });
  });

  // Product cards: staggered fade/scale on enter
  gsap.utils.toArray(".card").forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 92%",
      },
      delay: (i % 3) * 0.08,
    });
  });
}

/* ---------------- Chapter 01: manifesto word reveal ---------------- */
function initManifesto() {
  const manifesto = document.querySelector(".manifesto");
  if (!manifesto) return;

  gsap.to(".manifesto .word", {
    color: (i, el) => (el.classList.contains("word--accent") ? "#e8590c" : "#17151c"),
    stagger: 0.08,
    ease: "none",
    scrollTrigger: {
      trigger: ".chapter-origin",
      start: "top 70%",
      end: "bottom 55%",
      scrub: true,
    },
  });
}

/* ---------------- Chapter 01: pulse line draw ---------------- */
function initPulseLine() {
  const path = document.getElementById("pulsePath");
  if (!path) return;
  const length = path.getTotalLength();
  path.style.strokeDasharray = String(length);
  path.style.strokeDashoffset = String(length);

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".chapter-origin",
      start: "top 80%",
      end: "bottom 30%",
      scrub: true,
    },
  });
}

/* ---------------- Chapter 02: horizontal scroll-jacked carousel ---------------- */
function initDropCarousel() {
  const section = document.querySelector(".chapter-drop");
  const track = document.getElementById("dropTrack");
  if (!section || !track) return;

  const getScrollAmount = () => track.scrollWidth - window.innerWidth;

  gsap.to(track, {
    x: () => -getScrollAmount(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => "+=" + getScrollAmount(),
      scrub: 1,
      pin: true,
      invalidateOnRefresh: true,
    },
  });
}

/* ---------------- Chapter 03: scrubbed stat counters ---------------- */
function initNumbersScrub() {
  const section = document.querySelector(".chapter-numbers");
  const nums = document.querySelectorAll(".num-block__num");
  if (!section || !nums.length) return;

  ScrollTrigger.create({
    trigger: section,
    start: "top 75%",
    end: "top 20%",
    scrub: true,
    onUpdate: (self) => {
      nums.forEach((el) => {
        const target = parseFloat(el.getAttribute("data-target"));
        const decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
        el.textContent = (target * self.progress).toFixed(decimals);
      });
    },
  });
}
