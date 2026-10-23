/* film.js — home. Il film «Verso lo studio»: quattro quadri, un vettore, soglie ad arco.
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
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
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
  var shade = function (l) { return l.querySelector('.film__shade'); };
  var beat1 = film.querySelector('.film__beat--1');
  var beat2 = film.querySelector('.film__beat--2');
  var beat3 = film.querySelector('.film__beat--3');
  var veil = film.querySelector('.film__veil');

  var ARCH_IN = 'inset(64% 45% 0% 45% round 50vw 50vw 0vw 0vw)';
  var ARCH_OUT = 'inset(-40% -34% 0% -34% round 50vw 50vw 0vw 0vw)';

  gsap.set([L.giorno, L.arco, L.targa], { clipPath: ARCH_IN, autoAlpha: 0 });   /* nascosti finché la loro soglia non si apre */
  gsap.set([img(L.giorno), img(L.arco), img(L.targa)], { scale: 1.14 });
  gsap.set([beat2, beat3], { autoAlpha: 0, y: 28 });

  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: film,
      start: 'top top',
      end: function () { return '+=' + Math.round(film.offsetHeight * 4.2); },
      pin: true,
      anticipatePin: 1,
      scrub: JUMP !== null ? true : 0.7,
      invalidateOnRefresh: true,
      onUpdate: function (self) { header.classList.toggle('header--film', self.progress < 0.93); }
    }
  });

  function soglia(layer, at, dur) {               /* l'immagine nuova entra dall'arco e si avvicina */
    tl.set(layer, { autoAlpha: 1 }, at);
    tl.fromTo(layer, { clipPath: ARCH_IN }, { clipPath: ARCH_OUT, duration: dur, ease: 'power2.in' }, at);
    tl.fromTo(img(layer), { scale: 1.14 }, { scale: 1, duration: dur + 0.35, ease: 'power1.out' }, at);
  }
  function indietro(layer, at, dur) {             /* l'immagine vecchia resta indietro, un po' più scura */
    tl.to(img(layer), { scale: 1.12, duration: dur, ease: 'power1.in' }, at);
    tl.to(shade(layer), { opacity: 0.4, duration: dur, ease: 'power1.in' }, at);
  }
  function beatIn(b, at) { tl.to(b, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' }, at); }
  function beatOut(b, at) { tl.to(b, { autoAlpha: 0, y: -24, duration: 0.24, ease: 'power2.in' }, at); }

  /* 1 — crepuscolo (0 → 1) */
  tl.fromTo(img(L.crepuscolo), { scale: 1 }, { scale: 1.06, duration: 1.0 }, 0);
  beatOut(beat1, 0.78);
  /* 2 — giorno (1 → 2.15) */
  indietro(L.crepuscolo, 1.0, 0.9);
  soglia(L.giorno, 1.0, 0.9);
  beatIn(beat2, 1.5);
  beatOut(beat2, 1.98);
  /* 3 — arco (2.15 → 3.3) */
  indietro(L.giorno, 2.15, 0.9);
  soglia(L.arco, 2.15, 0.9);
  beatIn(beat3, 2.62);
  beatOut(beat3, 3.12);
  /* 4 — targa, poi il bianco della pagina (3.3 → 4.2) */
  indietro(L.arco, 3.3, 0.8);
  soglia(L.targa, 3.3, 0.75);
  tl.to(veil, { opacity: 1, duration: 0.35, ease: 'power1.in' }, 3.85);

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
