/* home.js — i pannelli fotografici scorrono uno sopra l'altro (CSS sticky).
   GSAP aggiunge profondità: il pannello coperto sale piano e si scurisce, quello nuovo arriva con la sua scheda. */
(function () {
  'use strict';
  var JUMP = new URLSearchParams(location.search).get('jump');
  function ready() { requestAnimationFrame(function () { requestAnimationFrame(function () { window.__ready = true; }); }); }
  function decoded() {
    return Promise.all([].map.call(document.querySelectorAll('.panel img'), function (i) { return i.decode ? i.decode().catch(function () {}) : 0; }));
  }
  if (JUMP !== null) history.scrollRestoration = 'manual';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap || !window.ScrollTrigger) {
    decoded().then(function () { if (JUMP !== null) scrollTo(0, +JUMP || 0); ready(); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var panels = [].slice.call(document.querySelectorAll('.panel'));
  panels.forEach(function (p, i) {
    var next = panels[i + 1];
    if (next) {
      var cover = { trigger: next, start: 'top bottom', end: 'top top', scrub: true };
      gsap.to(p.querySelector('.panel__media'), { yPercent: -14, ease: 'none', scrollTrigger: cover });
      gsap.to(p.querySelector('.panel__shade'), { opacity: 0.6, ease: 'none', scrollTrigger: cover });
    }
    if (i > 0) {
      gsap.fromTo(p.querySelector('.panel__media img'), { scale: 1.12 }, { scale: 1, ease: 'none',
        scrollTrigger: { trigger: p, start: 'top bottom', end: 'top top', scrub: true } });
      var card = p.querySelector('.panel__card');
      if (card) gsap.fromTo(card, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: 'power2.out',
        scrollTrigger: { trigger: p, start: 'top 55%', end: 'top 10%', scrub: true } });
    }
  });

  /* ingresso del titolo al caricamento */
  var h = document.querySelector('.hero__text');
  if (h && JUMP === null && scrollY < 10) {
    gsap.from(h.children, { y: 34, autoAlpha: 0, duration: 1.2, ease: 'power3.out', stagger: 0.14, delay: 0.15, clearProps: 'all' });
  }

  decoded().then(function () {
    ScrollTrigger.refresh();
    if (JUMP !== null) { scrollTo(0, +JUMP || 0); ScrollTrigger.update(); }
    ready();
  });
})();
