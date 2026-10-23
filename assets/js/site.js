/* site.js — header, menu mobile, anno, video in vista, modulo contatti (Web3Forms). Null-safe: incluso in tutte le pagine. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var header = document.querySelector('.header');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ombra del header quando si scorre */
  if (header) {
    var onScroll = function () { header.classList.toggle('header--scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* menu mobile */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu && header) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
      menu.hidden = !open;
      doc.classList.toggle('menu-open', open);
      header.classList.toggle('header--menu', open);
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
    var mq = window.matchMedia('(min-width: 1024px)');
    (mq.addEventListener ? mq.addEventListener('change', function (e) { if (e.matches) setOpen(false); }) : null);
  }

  /* anno nel footer */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* video: parte solo quando è in vista; con motion ridotto resta sul poster con i controlli */
  Array.prototype.forEach.call(document.querySelectorAll('video[data-autoplay-inview]'), function (v) {
    if (reduce || !('IntersectionObserver' in window)) { v.controls = true; return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () { v.controls = true; });
        } else { v.pause(); }
      });
    }, { threshold: 0.35 });
    io.observe(v);
  });

  /* animazioni SVG (SMIL) in pausa con motion ridotto */
  if (reduce) {
    Array.prototype.forEach.call(document.querySelectorAll('svg'), function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
  }

  /* modulo contatti */
  var form = document.querySelector('form[data-form]');
  if (form) {
    var status = form.querySelector('.form__status');
    var btn = form.querySelector('button[type="submit"]');
    var keyField = form.querySelector('[name="access_key"]');
    var say = function (kind, text) { status.className = 'form__status' + (kind ? ' form__status--' + kind : ''); status.textContent = text; };
    var labelOf = function (f) { var l = form.querySelector('label[for="' + f.id + '"]'); return l ? l.textContent.replace('*', '').trim() : f.name; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('[name="_gotcha"]');
      if (hp && hp.value) return;
      var invalid = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (f) {
        var ok = f.checkValidity();
        f.setAttribute('aria-invalid', ok ? 'false' : 'true');
        return !ok;
      });
      if (invalid.length) {
        say('err', 'Compila i campi obbligatori: ' + invalid.map(labelOf).join(', ') + '.');
        invalid[0].focus();
        return;
      }
      if (!keyField || !keyField.value || keyField.value === 'WEB3FORMS_ACCESS_KEY') {
        say('err', 'Il modulo non è ancora attivo. Scrivici a info@damicoandpartners.it o chiama lo 030 240 3392.');
        return;
      }
      btn.disabled = true;
      say('', 'Invio in corso…');
      fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.success) { say('ok', 'Richiesta inviata. Ti ricontattiamo al più presto.'); form.reset(); }
          else { say('err', 'Invio non riuscito. Riprova, oppure scrivici a info@damicoandpartners.it.'); }
        })
        .catch(function () { say('err', 'Connessione non riuscita. Riprova, oppure scrivici a info@damicoandpartners.it.'); })
        .then(function () { btn.disabled = false; });
    });
  }
})();
