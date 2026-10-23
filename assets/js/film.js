/* film.js — home. Quattro quadri a dissolvenza: ogni immagine fa un lento zoom, la successiva sfuma sopra.
   Richiede gsap + ScrollTrigger + Lenis (assets/vendor). Senza di essi, o con motion ridotto, resta il primo quadro. */
(function () {
  'use strict';
  var film = document.querySelector('.film');
  if (!film) return;
  var header = document.querySelector('.header');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(location.search);
  var JUMP = params.get('jump');
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  function setReady() {
    requestAnimationFrame(function () { requestAnimationFrame(function () { window.__ready = true; }); });
  }
  function decodeAll() {
    var imgs = Array.prototype.slice.call(film.querySelectorAll('img'));
    return Promise.all(imgs.map(function (i) {
      return (i.decode ? i.decode() : Promise.resolve()).catch(function () {});
    }));
  }

  /* ---- fallback statico ---- */
  if (reduce || !hasGsap) {
    film.classList.add('film--static');
    var onS = function () { header.classList.toggle('header--film', window.scrollY < film.offsetHeight - 80); };
    window.addEventListener('scroll', onS, { passive: true });
    if (JUMP !== null) { history.scrollRestoration = 'manual'; window.scrollTo(0, +JUMP || 0); }
    onS();
    decodeAll().then(setReady);
    return;
  }

  if (JUMP !== null) history.scrollRestoration = 'manual';
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---- scroll morbido ---- */
  var lenis = null;
  if (window.Lenis && JUMP === null) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  var L = {
    crepuscolo: film.querySelector('.film__layer--crepuscolo'),
    giorno: film.querySelector('.film__layer--giorno'),
    arco: film.querySelector('.film__layer--arco'),
    targa: film.querySelector('.film__layer--targa')
  };
  var img = function (l) { return l.querySelector('img'); };
  var beat1 = film.querySelector('.film__beat--1');
  var beat2 = film.querySelector('.film__beat--2');
  var beat3 = film.querySelector('.film__beat--3');
  var veil = film.querySelector('.film__veil');

  gsap.set([L.giorno, L.arco, L.targa], { autoAlpha: 0 });
  gsap.set([beat2, beat3], { autoAlpha: 0, y: 24 });

  /* durata totale del blocco fisso: 2,6 schermate di scroll (la timeline va da 0 a 2.6) */
  var LEN = 2.6;
  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: film,
      start: 'top top',
      end: function () { return '+=' + Math.round(film.offsetHeight * LEN); },
      pin: true,
      anticipatePin: 1,
      scrub: JUMP !== null ? true : 0.4,
      invalidateOnRefresh: true,
      onUpdate: function (self) { header.classList.toggle('header--film', self.progress < 0.92); }
    }
  });

  /* ogni quadro fa un lento zoom per tutta la sua vita; il successivo sfuma sopra */
  function zoom(layer, from, to, at, dur) {
    tl.fromTo(img(layer), { scale: from }, { scale: to, duration: dur }, at);
  }
  function dissolvi(layer, at, dur) {
    tl.to(layer, { autoAlpha: 1, duration: dur, ease: 'power1.inOut' }, at);
  }
  function beatIn(b, at) { tl.to(b, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out' }, at); }
  function beatOut(b, at) { tl.to(b, { autoAlpha: 0, y: -18, duration: 0.14, ease: 'power2.in' }, at); }

  /* 1 — crepuscolo */
  zoom(L.crepuscolo, 1.0, 1.08, 0, 1.0);
  beatOut(beat1, 0.5);
  /* 2 — giorno */
  zoom(L.giorno, 1.06, 1.12, 0.6, 0.95);
  dissolvi(L.giorno, 0.6, 0.32);
  beatIn(beat2, 0.9);
  beatOut(beat2, 1.22);
  /* 3 — arco */
  zoom(L.arco, 1.06, 1.12, 1.3, 0.95);
  dissolvi(L.arco, 1.3, 0.32);
  beatIn(beat3, 1.6);
  beatOut(beat3, 1.92);
  /* 4 — targa, poi il bianco della pagina */
  zoom(L.targa, 1.05, 1.0, 2.0, 0.6);
  dissolvi(L.targa, 2.0, 0.3);
  tl.to(veil, { opacity: 1, duration: 0.25, ease: 'power1.in' }, 2.35);

  /* una sola rivelazione al caricamento, solo in cima */
  if (JUMP === null && window.scrollY < 10) {
    gsap.from(beat1.querySelector('h1'), { autoAlpha: 0, y: 26, duration: 1.3, ease: 'power3.out', delay: 0.2, clearProps: 'all' });
  }

  /* misuratore di scatti in console: ?jank */
  if (params.has('jank')) {
    var last = performance.now(), max = 0, t0 = last;
    (function tick() {
      var now = performance.now(); max = Math.max(max, now - last); last = now;
      if (now - t0 > 2000) { console.log('rAF max delta (ms):', max.toFixed(1)); max = 0; t0 = now; }
      requestAnimationFrame(tick);
    })();
  }

  /* contratto dev: ?jump=<y> atterra già scrollato e a regime; __ready solo a immagini decodificate */
  decodeAll().then(function () {
    ScrollTrigger.refresh();
    if (JUMP !== null) {
      window.scrollTo(0, +JUMP || 0);
      ScrollTrigger.update();
      requestAnimationFrame(function () { ScrollTrigger.update(); setReady(); });
    } else {
      setReady();
    }
  });
})();
