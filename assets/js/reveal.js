/* Reveal on scroll — D'Amico & Partners
   - Entrata dolce (fade + slide/scale) via IntersectionObserver: funziona su
     QUALSIASI dispositivo, touch incluso (non dipende dall'hover).
   - Auto-targeting: oltre agli elementi con .reveal già nell'HTML, applica il
     reveal a testo/heading/immagini/blocchi ricorrenti su tutte le pagine,
     così non serve annotare ogni elemento a mano.
   - Stagger: elementi reveal che condividono lo stesso genitore entrano in
     sequenza (30–50ms+ l'uno dall'altro), per un effetto ordinato e percepibile.
   - Rispetta prefers-reduced-motion (mostra tutto subito, nessuna animazione). */
(function () {
  'use strict';

  /* Selettori auto-reveal: blocchi di contenuto comuni a tutte le pagine.
     Si aggiungono a quelli già marcati .reveal nell'HTML (card, stat, step…). */
  var AUTO = [
    '.hero__eyebrow', '.hero__title', '.hero__subtitle',
    '.hero .btn-group', '.hero__cta',
    '.section-header',
    '.manifesto__mark', '.manifesto__quote', '.manifesto__author',
    '.final-cta h2', '.final-cta > .container > p',
    '.final-cta .btn-group', '.final-cta .form',
    '.trust-strip__item',
    '.banner',
    '.location-hero__map', '.location-hero__panel',
    '.location-section__header', '.form-section__header'
  ];

  /* Elementi che entrano meglio con un effetto "scale" (immagini / visual). */
  var SCALE = ['.hero-cluster', '.hero__decor', '.hero__media', '.location-hero__map'];

  function matches(el, list) {
    for (var i = 0; i < list.length; i++) {
      if (el.matches(list[i])) return true;
    }
    return false;
  }

  // Raccoglie il set di elementi da rivelare (deduplicato).
  var set = [];
  var seen = (typeof Set === 'function') ? new Set() : null;
  function add(el) {
    if (!el) return;
    if (seen) { if (seen.has(el)) return; seen.add(el); }
    else if (set.indexOf(el) !== -1) return;
    el.classList.add('reveal');
    set.push(el);
  }

  document.querySelectorAll('.reveal').forEach(add);
  AUTO.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(add);
  });

  if (!set.length) return;

  // Assegna variante "scale" agli elementi visual che non hanno già un data-reveal.
  set.forEach(function (el) {
    if (!el.getAttribute('data-reveal') && matches(el, SCALE)) {
      el.setAttribute('data-reveal', 'scale');
    }
  });

  // Stagger: indicizza gli elementi reveal per genitore comune.
  var groups = (typeof Map === 'function') ? new Map() : null;
  if (groups) {
    set.forEach(function (el) {
      var p = el.parentElement;
      var arr = groups.get(p);
      if (!arr) { arr = []; groups.set(p, arr); }
      arr.push(el);
    });
    groups.forEach(function (arr) {
      if (arr.length < 2) return;            // singolo figlio: nessun ritardo
      arr.forEach(function (el, i) {
        var step = Math.min(i, 6) * 80;      // cap a ~480ms per non far attendere troppo
        el.style.setProperty('--reveal-delay', step + 'ms');
      });
    });
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    set.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

  set.forEach(function (el) { io.observe(el); });
})();
