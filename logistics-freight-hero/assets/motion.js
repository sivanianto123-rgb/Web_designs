// Homepage-only motion layer: GSAP/ScrollTrigger-driven scroll progress,
// reveals, counters, horizontal-pin gallery, video zoom, plus small
// vanilla-JS tilt/magnetic hover details — all on native scroll.
// Everything here degrades to a static, fully-visible page under
// prefers-reduced-motion, and the whole file no-ops if GSAP failed to load.
//
// Deliberately NOT using Lenis smooth-scroll here: it drives scroll via
// its own continuously-animated, eased position, which actively fights
// native CSS scroll-snap (used below) for control of where scroll comes
// to rest — confirmed as a real bug (scroll resistance/stutter, and with
// snap-type:mandatory a gesture that never reaches the next boundary) in
// this repo's sibling stride/ project, which hit the identical
// Lenis+scroll-snap combination and removed Lenis for the same reason.
// GSAP ScrollTrigger needs no scroll library to function.
(function(){
  if (typeof gsap === 'undefined') return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatCount(el, val){
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';
    var decimals = el.getAttribute('data-count-decimals') ? parseInt(el.getAttribute('data-count-decimals'), 10) : 0;
    var n = val === undefined ? parseFloat(el.getAttribute('data-count-to')) : val;
    return prefix + n.toFixed(decimals) + suffix;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---------- Scroll progress bar ----------
  var progress = document.querySelector('.scroll-progress');
  if (progress) {
    gsap.to(progress, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 'top top', end: 'max', scrub: true }
    });
  }

  if (reduceMotion) {
    // Render everything in its final, visible state and skip all scrub/pin motion.
    document.querySelectorAll('[data-reveal]').forEach(function(el){
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    document.querySelectorAll('.reveal-word__inner').forEach(function(el){
      el.style.transform = 'none';
      el.style.opacity = 1;
    });
    document.querySelectorAll('.stat__num[data-count-to]').forEach(function(el){
      el.textContent = formatCount(el);
    });
    var track = document.querySelector('.hcards-track');
    if (track) track.style.transform = 'none';
    return;
  }

  // ---------- Reveal-on-scroll (fade / left / right) ----------
  document.querySelectorAll('[data-reveal]').forEach(function(el){
    var mode = el.getAttribute('data-reveal');
    var from = mode === 'left' ? { x: -40, opacity: 0 }
      : mode === 'right' ? { x: 40, opacity: 0 }
      : { y: 32, opacity: 0 };
    gsap.fromTo(el, from, {
      x: 0, y: 0, opacity: 1,
      duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  // ---------- Staggered phrase reveal (story statement) ----------
  var statement = document.querySelector('.story-statement p');
  if (statement) {
    var words = statement.querySelectorAll('.reveal-word__inner');
    gsap.fromTo(words, { yPercent: 120, opacity: 0 }, {
      yPercent: 0, opacity: 1,
      duration: 0.9, ease: 'power3.out', stagger: 0.035,
      scrollTrigger: { trigger: statement, start: 'top 85%' }
    });
  }

  // ---------- Scroll-scrubbed stat counters ----------
  document.querySelectorAll('.stat__num[data-count-to]').forEach(function(el){
    var target = parseFloat(el.getAttribute('data-count-to'));
    var counter = { val: 0 };
    gsap.to(counter, {
      val: target,
      duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: function(){
        el.textContent = formatCount(el, counter.val);
      }
    });
  });

  // ---------- Hero exit: depth transition into the story ----------
  // The hero's own background video pushes in (scale, GPU-accelerated
  // transform only) while its content fades, as the user scrolls from
  // the hero into the statement section — a layered-depth parallax
  // moment bridging the pixel-exact hero and the scrollable story below.
  // Targets .bg / .stage opacity rather than .stage's transform, since
  // .stage already carries a static CSS transform:scale(var(--s)) for
  // its pixel-exact layout that a GSAP-driven inline transform would
  // otherwise silently overwrite.
  var heroFrame = document.querySelector('.frame');
  var heroBg = document.querySelector('.frame .bg');
  var heroStage = document.querySelector('.stage');
  if (heroFrame && heroBg && heroStage) {
    gsap.to(heroBg, {
      scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: heroFrame, start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to(heroStage, {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: heroFrame, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // ---------- Video band: scrubbed zoom-settle ----------
  var bandVideo = document.querySelector('.video-band__media');
  var band = document.querySelector('.video-band');
  if (bandVideo && band) {
    gsap.fromTo(bandVideo, { scale: 1.18 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  // ---------- Horizontal-pin services gallery (desktop only) ----------
  var mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', function(){
    var pinWrap = document.querySelector('.hcards-pin');
    var track = document.querySelector('.hcards-track');
    if (!pinWrap || !track) return;
    var amount = function(){ return Math.max(0, track.scrollWidth - pinWrap.offsetWidth); };
    var tween = gsap.to(track, {
      x: function(){ return -amount(); },
      ease: 'none',
      scrollTrigger: {
        trigger: pinWrap,
        start: 'top top+=' + (document.querySelector('.nav') ? 76 : 0),
        end: function(){ return '+=' + (amount() + 1); },
        scrub: true,
        pin: true,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });
    return function(){ tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); };
  });

  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    // ---------- Card tilt-on-hover (pointer:fine only) ----------
    // rAF-throttled, with the bounding rect cached on enter rather than
    // re-read on every mousemove: mousemove can fire far faster than the
    // screen repaints (hundreds of times a second on a high-poll-rate
    // mouse/trackpad), and getBoundingClientRect() forces a synchronous
    // layout — doing that on every single event, right on top of GSAP's
    // own scrub/pin work in this same horizontal gallery, is a real,
    // measurable source of extra layout passes and jank, not just a
    // theoretical one (confirmed via CDP layout-count deltas: hovering a
    // card while scrolling costs dozens of extra forced layouts over the
    // unthrottled version).
    document.querySelectorAll('.tilt').forEach(function(wrap){
      var el = wrap.querySelector('.tilt-el') || wrap;
      var rect = null;
      var pendingX = 0, pendingY = 0, tiltTicking = false;
      var applyTilt = function(){
        el.style.transform = 'rotateY(' + (pendingX * 8).toFixed(2) + 'deg) rotateX(' + (pendingY * -8).toFixed(2) + 'deg) translateZ(4px)';
        tiltTicking = false;
      };
      wrap.addEventListener('mouseenter', function(){ rect = wrap.getBoundingClientRect(); });
      wrap.addEventListener('mousemove', function(e){
        if (!rect) rect = wrap.getBoundingClientRect();
        pendingX = (e.clientX - rect.left) / rect.width - 0.5;
        pendingY = (e.clientY - rect.top) / rect.height - 0.5;
        if (!tiltTicking) {
          tiltTicking = true;
          requestAnimationFrame(applyTilt);
        }
      });
      wrap.addEventListener('mouseleave', function(){
        rect = null;
        el.style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
      });
    });

    // ---------- Magnetic buttons ----------
    // Same cached-rect pattern as the tilt cards above: the rect only
    // needs to be read once per hover, not on every mousemove.
    document.querySelectorAll('.magnetic').forEach(function(btn){
      var rect = null;
      btn.addEventListener('mouseenter', function(){ rect = btn.getBoundingClientRect(); });
      btn.addEventListener('mousemove', function(e){
        if (!rect) rect = btn.getBoundingClientRect();
        var mx = (e.clientX - rect.left - rect.width / 2) * 0.35;
        var my = (e.clientY - rect.top - rect.height / 2) * 0.45;
        gsap.to(btn, { x: mx, y: my, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', function(){
        rect = null;
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
      });
    });

    // ---------- Custom cursor ----------
    var cursor = document.getElementById('cursor');
    var cursorLabel = document.getElementById('cursorLabel');
    if (cursor && cursorLabel) {
      document.body.classList.add('has-custom-cursor');
      var mouseX = 0, mouseY = 0, curX = 0, curY = 0;
      window.addEventListener('mousemove', function(e){
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
      (function renderCursor(){
        var dx = mouseX - curX, dy = mouseY - curY;
        // Skip the style write once the dot has caught up to the real
        // cursor — otherwise this loop forces a transform write every
        // single frame for the entire page lifetime, even while the
        // mouse sits still.
        if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
          curX += dx * 0.2;
          curY += dy * 0.2;
          cursor.style.transform = 'translate(' + curX.toFixed(1) + 'px,' + curY.toFixed(1) + 'px) translate(-50%,-50%)';
        }
        requestAnimationFrame(renderCursor);
      })();
      document.querySelectorAll('[data-cursor], .card, a, button').forEach(function(el){
        el.addEventListener('mouseenter', function(){
          cursorLabel.textContent = el.getAttribute('data-cursor') || '';
          cursor.classList.add('is-hovering');
        });
        el.addEventListener('mouseleave', function(){
          cursorLabel.textContent = '';
          cursor.classList.remove('is-hovering');
        });
      });
    }
  }

  // ---------- Chapter HUD ----------
  (function(){
    var hud = document.getElementById('chapterHud');
    var indexEl = document.getElementById('chapterHudIndex');
    var nameEl = document.getElementById('chapterHudName');
    var chapters = document.querySelectorAll('[data-chapter-index]');
    if (!hud || !chapters.length) return;

    var first = chapters[0];
    var last = chapters[chapters.length - 1];

    // Only show the HUD while a chapter is actually on screen, so it
    // never sits on top of the hero or the closing CTA/footer.
    var toggleVisible = function(){
      var firstTop = first.getBoundingClientRect().top + window.scrollY;
      var lastBottom = last.getBoundingClientRect().bottom + window.scrollY;
      var probe = window.scrollY + window.innerHeight * 0.5;
      hud.classList.toggle('is-visible', probe > firstTop && probe < lastBottom);
    };
    toggleVisible();
    window.addEventListener('scroll', toggleVisible, { passive: true });
    window.addEventListener('resize', toggleVisible);

    var chapterIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          indexEl.textContent = entry.target.getAttribute('data-chapter-index');
          nameEl.textContent = entry.target.getAttribute('data-chapter-name');
        }
      });
    }, { threshold: 0.5 });
    chapters.forEach(function(c){ chapterIo.observe(c); });
  })();

  ScrollTrigger.addEventListener('refreshInit', function(){
    document.querySelectorAll('.hcards-track').forEach(function(t){ t.style.transform = ''; });
  });
})();
