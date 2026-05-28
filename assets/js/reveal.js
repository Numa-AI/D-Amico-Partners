/* Reveal on scroll — D'Amico & Partners
   - IntersectionObserver per fade-in dolce
   - Rispetta prefers-reduced-motion */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });

  targets.forEach((el) => io.observe(el));
})();
