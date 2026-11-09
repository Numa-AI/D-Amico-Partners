/* site.js — header, menu, anno, video, modulo contatti. Incluso in tutte le pagine. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.header');

  /* header trasparente sopra la prima immagine della home */
  if (header && header.hasAttribute('data-over')) {
    // la testata può essere più alta dello schermo (prova-torre): conta tutta la sua altezza
    var testata = document.querySelector('.hero');
    var over = function () { header.classList.toggle('header--over', scrollY < (testata ? testata.offsetHeight : innerHeight) - innerHeight * 0.15); };
    addEventListener('scroll', over, { passive: true }); addEventListener('resize', over); over();
  }

  /* prova-torre, sul telefono: il titolo nel cielo si dissolve mentre si scende lungo la torre.
     Cambia solo la trasparenza, niente movimento: vale anche con Riduci movimento */
  var titolo = document.querySelector('.torre .hero__testo');
  if (titolo) {
    var stretto = matchMedia('(max-width: 899px)'), attesa = 0;
    var sfuma = function () {
      attesa = 0;
      titolo.style.opacity = stretto.matches ? Math.max(0, 1 - scrollY / (innerHeight * 0.2)).toFixed(3) : '';
    };
    addEventListener('scroll', function () { if (!attesa) attesa = requestAnimationFrame(sfuma); }, { passive: true });
    addEventListener('resize', sfuma); sfuma();
  }

  /* menu */
  var menu = document.getElementById('menu'), open = document.querySelector('.burger'), close = document.querySelector('.menu__close');
  if (menu && open && close) {
    var set = function (v) {
      menu.hidden = !v; open.setAttribute('aria-expanded', String(v));
      document.documentElement.classList.toggle('lock', v);
      (v ? close : open).focus();
    };
    open.addEventListener('click', function () { set(true); });
    close.addEventListener('click', function () { set(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) set(false); });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* video: parte quando è in vista */
  document.querySelectorAll('video[data-inview]').forEach(function (v) {
    if (reduce || !('IntersectionObserver' in window)) return; /* resta il fotogramma fermo, senza barra dei controlli */
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.4 }).observe(v);
  });
  if (reduce) document.querySelectorAll('svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });

  /* modulo contatti: lo riceve functions/api/contatto.js (Cloudflare Pages) e lo inoltra via Brevo */
  var form = document.querySelector('form[data-form]');
  if (form) {
    var st = form.querySelector('.status'), btn = form.querySelector('[type="submit"]');
    var say = function (k, t) { st.className = 'status' + (k ? ' status--' + k : ''); st.textContent = t; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_gotcha"]').value) return;
      var bad = [].filter.call(form.querySelectorAll('[required]'), function (f) {
        var ok = f.checkValidity(); f.setAttribute('aria-invalid', ok ? 'false' : 'true'); return !ok;
      });
      if (bad.length) {
        say('err', 'Compila i campi obbligatori: ' + bad.map(function (f) {
          var l = form.querySelector('label[for="' + f.id + '"]'); return l ? l.textContent.replace('*', '').trim() : 'presa visione dell’informativa privacy';
        }).join(', ') + '.');
        bad[0].focus(); return;
      }
      btn.disabled = true; say('', 'Invio in corso…');
      fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (r) { return r.json().catch(function () { return null; }); })
        .then(function (d) { if (d && d.ok) { say('ok', 'Richiesta inviata. Ti ricontattiamo al più presto.'); form.reset(); } else say('err', 'Invio non riuscito. Riprova o scrivici a info@damicoandpartners.it.'); })
        .catch(function () { say('err', 'Connessione non riuscita. Riprova o scrivici a info@damicoandpartners.it.'); })
        .then(function () { btn.disabled = false; });
    });
  }
})();

// legali: su schermi stretti l'indice parte chiuso
(function () {
  var d = document.querySelector('.indice details');
  if (d && matchMedia('(max-width: 1023px)').matches) d.open = false;
})();
