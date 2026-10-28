/* motion.js — il movimento del sito, su tutte le pagine. Scroll nativo, niente sezioni bloccate.
   - testata della home: la piazza con la luce dell'ora di Brescia; scorrendo, la luce passa all'altra foto
   - ogni sezione entra a pezzi (titolo, testo, foto) una volta sola
   - le foto grandi si spostano piano rispetto alla pagina */
(function () {
  'use strict';
  var root = document.documentElement;
  var JUMP = new URLSearchParams(location.search).get('jump');
  function ready() { requestAnimationFrame(function () { requestAnimationFrame(function () { window.__ready = true; }); }); }
  if (JUMP !== null) history.scrollRestoration = 'manual';

  /* luce dell'ora: di giorno la piazza al sole, dalle 18 alle 7 i portici illuminati */
  var hero = document.querySelector('.hero');
  var prima, dopo;
  if (hero) {
    var ora = +new Intl.DateTimeFormat('it-IT', { hour: 'numeric', hour12: false, timeZone: 'Europe/Rome' }).format(new Date());
    var giorno = hero.querySelector('.giorno'), sera = hero.querySelector('.sera');
    var notte = ora >= 18 || ora < 7;
    prima = notte ? sera : giorno; dopo = notte ? giorno : sera;
    prima.classList.remove('alt'); dopo.classList.add('alt');
    hero.querySelector('.hero__luce').appendChild(prima);
    prima.style.opacity = 1; dopo.style.opacity = 0;
  }

  function decoded() {
    return Promise.all([].map.call(document.querySelectorAll('.hero img, .phero img'), function (i) { return i.decode ? i.decode().catch(function () {}) : 0; }));
  }

  if (!root.classList.contains('anim') || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove('anim');
    decoded().then(function () { if (JUMP !== null) scrollTo(0, +JUMP || 0); ready(); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var EASE = 'power3.out';

  /* testata della home */
  if (hero) {
    var luce = hero.querySelector('.hero__luce');
    gsap.fromTo(luce, { scale: 1.08 }, { scale: 1, duration: 2.6, ease: 'power2.out' });
    var esce = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 };
    gsap.to(luce, { yPercent: 12, ease: 'none', scrollTrigger: esce });
    gsap.to(prima, { opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: '15% top', end: '75% top', scrub: 1 } });
    gsap.to(dopo, { opacity: 1, ease: 'none', scrollTrigger: { trigger: hero, start: '15% top', end: '75% top', scrub: 1 } });
    gsap.to(hero.querySelector('.hero__testo'), { yPercent: -18, ease: 'none', scrollTrigger: esce });
    var t = hero.querySelectorAll('[data-in]');
    gsap.fromTo(t, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: EASE, stagger: 0.09, delay: 0.2 });
  }

  /* entrate: nelle pagine senza [data-in] scelgo io i pezzi di ogni sezione */
  var AUTO = '.phero__card > *, .servizio__art, .servizio h2, .servizio .prose > *, .colonne .prose > *, .aree a, .citazione p, .chiudi > *, .rec-list > div, .form, .legal .narrow > *';
  document.querySelectorAll(AUTO).forEach(function (el) { el.setAttribute('data-in', ''); });
  var pezzi = [].filter.call(document.querySelectorAll('[data-in]'), function (el) {
    return !(hero && hero.contains(el)) && !el.parentElement.closest('[data-in]');
  });
  ScrollTrigger.batch(pezzi, {
    start: 'top 92%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: EASE, stagger: 0.075, overwrite: true }); }
  });

  /* foto che si spostano piano */
  document.querySelectorAll('[data-drift], .phero__img img, .competenze__foto img, .intro__foto img, .colonne__foto img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
  });

  decoded().then(function () {
    ScrollTrigger.refresh();
    if (JUMP !== null) { scrollTo(0, +JUMP || 0); ScrollTrigger.update(); }
    ready();
  });
})();
