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

  /* foto che si spostano piano (la targa no: resta ferma) */
  document.querySelectorAll('[data-drift], .phero__img img, .competenze__foto img, .intro__foto img, .colonne__foto img').forEach(function (img) {
    if (/targa/.test(img.getAttribute('src'))) return;
    gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
  });

  /* approccio: i passi entrano uno alla volta, legati da una scia di puntini che scende a gradino */
  var gradini = document.querySelector('.gradini');
  var scia = null;
  function traccia() {
    if (scia) { scia.tl.scrollTrigger.kill(); scia.tl.kill(); scia.svg.remove(); }
    var NS = 'http://www.w3.org/2000/svg', passi = gradini.querySelectorAll('.gradino');
    gsap.set(passi, { clearProps: 'all' });
    var box = gradini.getBoundingClientRect();
    var r = [].map.call(passi, function (g) { return [g.getBoundingClientRect(), g.querySelector('h3').getBoundingClientRect()]; });
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'gradini__scia'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', box.width); svg.setAttribute('height', box.height);
    gradini.insertBefore(svg, gradini.firstChild);
    var tl = gsap.timeline({ scrollTrigger: { trigger: gradini, start: 'top 70%', end: 'bottom 60%', scrub: 1.2 } });
    [].forEach.call(passi, function (g, i) {
      tl.fromTo(g, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out' });
      var dopo = passi[i + 1];
      if (!dopo) return;
      var a = r[i][0], b = r[i + 1][0], t = r[i + 1][1];
      var x0 = r[i][1].left - box.left + 8, y0 = a.bottom - box.top + 18, lati = t.left - r[i][1].left > 40;
      // a destra: giù fino a metà del titolo seguente, poi verso di lui; in colonna: dritto in giù
      var y1 = lati ? t.top - box.top + t.height * .55 : t.top - box.top - 18, x1 = lati ? t.left - box.left - 22 : x0;
      var tappe = [[x0, y0], [x0, y1]];
      if (lati) tappe.push([x1, y1]);
      var punti = [];
      for (var k = 1; k < tappe.length; k++) {
        var p = tappe[k - 1], q = tappe[k], d = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(1, Math.round(d / 15));
        for (var j = k === 1 ? 0 : 1; j <= n; j++) punti.push([p[0] + (q[0] - p[0]) * j / n, p[1] + (q[1] - p[1]) * j / n]);
      }
      var cerchi = punti.slice(0, -1).map(function (pt) {
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', pt[0]); c.setAttribute('cy', pt[1]); c.setAttribute('r', 2);
        svg.appendChild(c); return c;
      });
      var freccia = document.createElementNS(NS, 'path');
      freccia.setAttribute('d', lati ? 'M' + (x1 - 8) + ',' + (y1 - 7) + 'l8,7l-8,7' : 'M' + (x1 - 7) + ',' + (y1 - 8) + 'l7,8l7,-8');
      svg.appendChild(freccia);
      tl.fromTo(cerchi, { autoAlpha: 0, attr: { r: 5 } }, { autoAlpha: 1, attr: { r: 2 }, duration: .25, ease: 'power1.out', stagger: 1.4 / cerchi.length });
      tl.fromTo(freccia, { autoAlpha: 0, x: lati ? -10 : 0, y: lati ? 0 : -10 }, { autoAlpha: 1, x: 0, y: 0, duration: .3 }, '-=.2');
    });
    scia = { svg: svg, tl: tl };
  }
  if (gradini) {
    var largo = innerWidth;
    addEventListener('resize', function () {
      clearTimeout(traccia.t);
      traccia.t = setTimeout(function () { if (innerWidth !== largo) { largo = innerWidth; traccia(); ScrollTrigger.refresh(); } }, 200);
    });
  }

  decoded().then(function () { return document.fonts ? document.fonts.ready : 0; }).then(function () {
    if (gradini) traccia();
    ScrollTrigger.refresh();
    if (JUMP !== null) { scrollTo(0, +JUMP || 0); ScrollTrigger.update(); }
    ready();
  });
})();
