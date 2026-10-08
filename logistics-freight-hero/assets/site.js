// Shared chrome: mobile nav toggle, current year, active link highlight.
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
})();
