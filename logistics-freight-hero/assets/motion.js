// Homepage-only motion layer: Lenis smooth scroll + GSAP/ScrollTrigger-driven
// scroll progress, reveals, counters, horizontal-pin gallery, video zoom,
// plus small vanilla-JS tilt/magnetic hover details.
// Everything here degrades to a static, fully-visible page under
// prefers-reduced-motion, and the whole file no-ops if GSAP failed to load.
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

  // ---------- Lenis smooth scroll ----------
  var lenis = null;
  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

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

  // ---------- Card tilt-on-hover (pointer:fine only) ----------
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.tilt').forEach(function(wrap){
      var el = wrap.querySelector('.tilt-el') || wrap;
      wrap.addEventListener('mousemove', function(e){
        var r = wrap.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'rotateY(' + (px * 8).toFixed(2) + 'deg) rotateX(' + (py * -8).toFixed(2) + 'deg) translateZ(4px)';
      });
      wrap.addEventListener('mouseleave', function(){
        el.style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
      });
    });

    // ---------- Magnetic buttons ----------
    document.querySelectorAll('.magnetic').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width / 2) * 0.35;
        var my = (e.clientY - r.top - r.height / 2) * 0.45;
        gsap.to(btn, { x: mx, y: my, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', function(){
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
      });
    });
  }

  ScrollTrigger.addEventListener('refreshInit', function(){
    document.querySelectorAll('.hcards-track').forEach(function(t){ t.style.transform = ''; });
  });
})();
