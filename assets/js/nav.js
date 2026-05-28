/* Navigation — D'Amico & Partners
   - Hamburger toggle for mobile menu
   - Sticky header shadow on scroll
   - Closes mobile menu on link click or Escape */
(function () {
  'use strict';

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  const body = document.body;

  if (!header) return;

  /* Sticky shadow on scroll */
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!toggle || !menu) return;

  /* Mobile menu toggle */
  const openMenu = () => {
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    body.classList.add('is-menu-open');
  };
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    body.classList.remove('is-menu-open');
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  });

  /* Close on link click */
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeMenu);
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });

  /* Close on viewport resize >= lg */
  const mq = window.matchMedia('(min-width: 1024px)');
  const onMqChange = (e) => { if (e.matches) closeMenu(); };
  if (mq.addEventListener) mq.addEventListener('change', onMqChange);
  else if (mq.addListener) mq.addListener(onMqChange);
})();
