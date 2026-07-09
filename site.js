/* ============================================================================
   D'Amico & Partners — interazioni della pagina (vanilla ES, defer).
   main.js resta dedicato all'hero; qui vivono:
   nav mobile, topbar scroll, parola rotante, accordion Metodo, tabs Audience,
   form Web3Forms, reveal on scroll, pausa SMIL su reduced-motion,
   sticky CTA bar mobile, anno footer.
   Rispetta prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Anno footer ---------- */
  (function year() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  })();

  /* ---------- Topbar: vetro scuro in scroll ---------- */
  (function topbar() {
    var bar = document.querySelector('.topbar');
    if (!bar) return;
    var onScroll = function () {
      if (window.scrollY > 10) bar.classList.add('is-scrolled');
      else bar.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------- Menu mobile (hamburger) ---------- */
  (function mobileMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('mobile-menu');
    var body = document.body;
    if (!toggle || !menu) return;

    var open = function () {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Chiudi il menu');
      menu.classList.add('is-open');
      body.classList.add('is-menu-open');
    };
    var close = function () {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Apri il menu');
      menu.classList.remove('is-open');
      body.classList.remove('is-menu-open');
    };

    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') close();
      else open();
    });
    /* Backdrop e pulsante X: ogni [data-menu-close] chiude il drawer */
    document.querySelectorAll('[data-menu-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        close();
        toggle.focus();
      }
    });
    var mq = window.matchMedia('(min-width: 1024px)');
    var onChange = function (e) { if (e.matches) close(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  })();

  /* ---------- Parola rotante nell'hero ---------- */
  (function heroWords() {
    var el = document.querySelector('[data-rotate]');
    if (!el) return;
    var words = (el.getAttribute('data-rotate') || '').split(',').map(function (w) { return w.trim(); });
    if (words.length < 2) return;
    var i = 0;
    el.textContent = words[0];
    if (reduceMotion) return;

    var hero = document.querySelector('.hero');
    if (!hero) return;

    function startRotation() {
      setInterval(function () {
        i = (i + 1) % words.length;
        el.style.opacity = '0';
        setTimeout(function () {
          el.textContent = words[i];
          el.style.opacity = '1';
        }, 220);
      }, 2600);
    }

    // Il titolo compare solo quando la hero raggiunge lo stato finale
    // (.ended = video finito, .static = fallback autoplay/reduced-motion).
    // Prima di allora è invisibile: se la rotazione partisse dal load, la
    // prima parola ("crescita") sarebbe già cambiata quando la scritta appare.
    // Facciamo quindi partire il ciclo da lì → prima parola ferma un attimo,
    // poi ruota. Il primo cambio arriva ~2.6s dopo la comparsa.
    function ready() {
      return hero.classList.contains('ended') || hero.classList.contains('static');
    }
    if (ready()) {
      startRotation();
    } else {
      var obs = new MutationObserver(function () {
        if (ready()) { obs.disconnect(); startRotation(); }
      });
      obs.observe(hero, { attributes: true, attributeFilter: ['class'] });
    }
  })();

  /* ---------- Metodo: accordion (mobile) / tab-panel sticky (desktop) ----------
     Disclosure pattern: aria-expanded sul bottone + aria-controls sul pannello.
     Un solo pannello aperto alla volta, coerente ai due breakpoint. */
  (function accordion() {
    var root = document.querySelector('[data-accordion]');
    if (!root) return;
    var buttons = Array.prototype.slice.call(root.querySelectorAll('.process-step[aria-controls]'));
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-expanded') === 'true') return; // resta sempre uno aperto
        buttons.forEach(function (b) {
          var on = b === btn;
          b.setAttribute('aria-expanded', on ? 'true' : 'false');
          var panel = document.getElementById(b.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
      });
    });
  })();

  /* ---------- Audience: tabs ARIA (PMI / In difficoltà / Privati) ---------- */
  (function tabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (root) {
      var tabList = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
      var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
      if (!tabList.length) return;

      var activate = function (tab, focus) {
        tabList.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.classList.toggle('is-active', on);
          t.tabIndex = on ? 0 : -1;
        });
        var controlled = tab.getAttribute('aria-controls');
        panels.forEach(function (p) { p.hidden = p.id !== controlled; });
        if (focus) tab.focus();
      };

      tabList.forEach(function (tab, i) {
        tab.addEventListener('click', function () { activate(tab); });
        tab.addEventListener('keydown', function (e) {
          var last = tabList.length - 1;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); activate(tabList[i === last ? 0 : i + 1], true); }
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); activate(tabList[i === 0 ? last : i - 1], true); }
          else if (e.key === 'Home') { e.preventDefault(); activate(tabList[0], true); }
          else if (e.key === 'End') { e.preventDefault(); activate(tabList[last], true); }
        });
      });
    });
  })();

  /* ---------- SMIL: le animazioni SVG native non rispettano prefers-reduced-motion
     via CSS. Le mettiamo in pausa esplicitamente. ---------- */
  if (reduceMotion) {
    document.querySelectorAll('.feature-visual svg').forEach(function (svg) {
      if (svg.pauseAnimations) svg.pauseAnimations();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  (function reveal() {
    var AUTO = [
      'header.mb-6', '.section-header',
      '.two-col > div',
      '.manifesto__mark', '.manifesto__quote', '.manifesto__author',
      '.final-cta h2', '.final-cta > .container > p', '.final-cta .form'
    ];
    var set = [];
    var seen = (typeof Set === 'function') ? new Set() : null;
    var add = function (el) {
      if (!el) return;
      if (seen) { if (seen.has(el)) return; seen.add(el); }
      else if (set.indexOf(el) !== -1) return;
      el.classList.add('reveal');
      set.push(el);
    };
    document.querySelectorAll('.reveal').forEach(add);
    AUTO.forEach(function (sel) { document.querySelectorAll(sel).forEach(add); });
    if (!set.length) return;

    /* Stagger fra elementi reveal con lo stesso genitore */
    if (typeof Map === 'function') {
      var groups = new Map();
      set.forEach(function (el) {
        var p = el.parentElement;
        var arr = groups.get(p);
        if (!arr) { arr = []; groups.set(p, arr); }
        arr.push(el);
      });
      groups.forEach(function (arr) {
        if (arr.length < 2) return;
        arr.forEach(function (el, i) {
          el.style.setProperty('--reveal-delay', Math.min(i, 6) * 80 + 'ms');
        });
      });
    }

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

  /* ---------- Sticky mobile CTA bar: visibile solo quando l'hero è fuori vista ---------- */
  (function mobileCta() {
    var hero = document.querySelector('.hero');
    var bar = document.querySelector('.mobile-cta-bar');
    if (!bar) return;
    if (!hero || !('IntersectionObserver' in window)) { bar.classList.add('is-visible'); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    io.observe(hero);
  })();

  /* ---------- Form: validazione client + invio Web3Forms + honeypot ---------- */
  (function forms() {
    var list = document.querySelectorAll('form[data-form]');
    if (!list.length) return;
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    list.forEach(function (form) {
      var feedback = form.querySelector('.form__feedback');
      var submitBtn = form.querySelector('button[type="submit"]');
      var endpoint = form.dataset.endpoint || form.getAttribute('action');
      var accessKey = form.querySelector('input[name="access_key"]');

      var showFeedback = function (msg, state) {
        if (!feedback) return;
        feedback.textContent = msg;
        feedback.classList.remove('is-success', 'is-error');
        if (state) feedback.classList.add('is-' + state);
      };
      var setError = function (field, msg) {
        var wrap = field.closest('.form__field');
        if (!wrap) return;
        wrap.classList.add('has-error');
        var err = wrap.querySelector('.form__error');
        if (err && msg) err.textContent = msg;
        field.setAttribute('aria-invalid', 'true');
      };
      var clearError = function (field) {
        var wrap = field.closest('.form__field');
        if (!wrap) return;
        wrap.classList.remove('has-error');
        field.removeAttribute('aria-invalid');
      };

      form.querySelectorAll('input, textarea').forEach(function (f) {
        f.addEventListener('input', function () { clearError(f); });
        f.addEventListener('change', function () { clearError(f); });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;

        var honey = form.querySelector('input[name="_gotcha"]');
        if (honey && honey.value) {
          showFeedback('Grazie, abbiamo ricevuto la vostra richiesta.', 'success');
          form.reset();
          return;
        }

        form.querySelectorAll('[required]').forEach(function (field) {
          if (!field.value.trim()) { setError(field, 'Questo campo è obbligatorio.'); valid = false; }
        });
        var email = form.querySelector('input[type="email"]');
        if (email && email.value && !emailRe.test(email.value.trim())) {
          setError(email, 'Inserite un indirizzo email valido.');
          valid = false;
        }
        if (!valid) {
          showFeedback('Controllate i campi evidenziati e riprovate.', 'error');
          return;
        }

        var notConfigured = !endpoint ||
          endpoint.indexOf('PLACEHOLDER') !== -1 ||
          (accessKey && accessKey.value.indexOf('WEB3FORMS_ACCESS_KEY') !== -1);
        if (notConfigured) {
          showFeedback('Demo: modulo pronto. Inserite la vostra access key Web3Forms per inviare davvero la richiesta.', 'success');
          form.reset();
          return;
        }

        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Invio in corso…'; }
        fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        }).then(function (res) {
          if (res.ok) {
            showFeedback('Grazie, abbiamo ricevuto la vostra richiesta. Vi ricontatteremo al più presto, in totale riservatezza.', 'success');
            form.reset();
          } else {
            showFeedback('Si è verificato un errore. Riprovate o contattateci telefonicamente.', 'error');
          }
        }).catch(function () {
          showFeedback('Si è verificato un errore di rete. Riprovate fra qualche istante o contattateci telefonicamente.', 'error');
        }).then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.label || 'Invia richiesta';
          }
        });
      });
    });
  })();
})();
