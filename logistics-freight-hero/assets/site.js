// Shared chrome: mobile nav toggle, current year, active link highlight,
// scroll-solid nav, scroll-reveal, and lightweight scroll-linked parallax.
(function(){
  var toggle = document.getElementById('navToggle');
  var mobile = document.getElementById('navMobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', function(){
      var open = mobile.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobile.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mobile.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach(function(el){
    el.textContent = new Date().getFullYear();
  });

  var path = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(function(a){
    var href = a.getAttribute('href');
    if (href === path) a.setAttribute('aria-current', 'page');
  });

  // Nav gains a solid background once the page has scrolled a little.
  var nav = document.querySelector('.nav');
  if (nav) {
    var setNavState = function(){
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    setNavState();
    window.addEventListener('scroll', setNavState, { passive: true });
  }

  // Scroll-triggered reveals and parallax: skipped here when the GSAP/
  // ScrollTrigger motion layer (assets/motion.js) is loaded on the page —
  // it drives [data-reveal]/[data-parallax] itself with richer control.
  // This block is the fallback for pages that only load site.js, and for
  // the rare case the GSAP vendor script itself failed to load.
  var gsapDriven = typeof window.gsap !== 'undefined';

  if (!gsapDriven) {
    document.querySelectorAll('.stat__num[data-count-to]').forEach(function(el){
      var target = parseFloat(el.getAttribute('data-count-to'));
      var prefix = el.getAttribute('data-count-prefix') || '';
      var suffix = el.getAttribute('data-count-suffix') || '';
      var decimals = el.getAttribute('data-count-decimals') ? parseInt(el.getAttribute('data-count-decimals'), 10) : 0;
      el.textContent = prefix + target.toFixed(decimals) + suffix;
    });
    document.querySelectorAll('.reveal-word__inner').forEach(function(el){
      el.style.transform = 'none';
      el.style.opacity = 1;
    });
    var track = document.querySelector('.hcards-track');
    if (track) track.style.transform = 'none';
  }

  var revealEls = gsapDriven ? [] : document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function(el){ io.observe(el); });
    } else {
      revealEls.forEach(function(el){ el.classList.add('is-revealed'); });
    }
  }

  // Lightweight scroll-linked parallax (skipped under reduced motion).
  var parallaxEls = gsapDriven ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    var updateParallax = function(){
      var vh = window.innerHeight;
      parallaxEls.forEach(function(el){
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -vh * 0.5 || rect.top > vh * 1.5) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        var offset = (rect.top - vh / 2) * speed;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
      ticking = false;
    };
    var onScroll = function(){
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateParallax();
  }
})();
