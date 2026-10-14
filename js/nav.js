/**
 * nav.js — Sidebar navigation: active state, mobile toggle,
 *           scroll spy, reading progress ring
 *
 * Carlos Manuel Turizo Hernández · GA4-240202501-AA1-EV03
 */

(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────────────────
  const sidebar    = document.querySelector('.sidebar');
  const navLinks   = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const menuToggle = document.getElementById('menu-toggle');
  const navClose   = document.getElementById('nav-close');
  const overlay    = document.getElementById('nav-overlay');
  const sections   = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  // ── Reading progress ring ─────────────────────────────────
  const ring         = document.getElementById('read-ring');
  const ringFill     = ring ? ring.querySelector('circle.fill') : null;
  const CIRCUMFERENCE = 120; // matches stroke-dasharray in animations.css

  function updateReadProgress() {
    if (!ring || !ringFill) return;
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const pct          = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    const offset       = CIRCUMFERENCE - pct * CIRCUMFERENCE;
    ringFill.style.strokeDashoffset = offset;
    // Show ring after first 10% scroll
    ring.classList.toggle('visible', pct > 0.03);
  }

  // ── Scroll spy ────────────────────────────────────────────
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveLink();
        updateReadProgress();
        ticking = false;
      });
      ticking = true;
    }
  }

  function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight * 0.35;
    let active = null;

    for (const section of sections) {
      const top = section.offsetTop;
      if (scrollMid >= top) active = section;
    }

    navLinks.forEach(a => {
      const target = a.getAttribute('href').slice(1);
      const isActive = active && active.id === target;
      a.classList.toggle('active', isActive);
    });
  }

  // ── Mobile menu ───────────────────────────────────────────
  function openMenu() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    requestAnimationFrame(() => overlay.classList.add('active'));
    document.body.style.overflow = 'hidden';
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
    overlay.addEventListener('transitionend', () => {
      overlay.classList.remove('visible');
    }, { once: true });
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (navClose)   navClose.addEventListener('click', closeMenu);
  if (overlay)    overlay.addEventListener('click', closeMenu);

  // Close mobile nav on link click
  navLinks.forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 767) closeMenu();
    });
  });

  // Escape key closes menu
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeMenu();
  });

  // ── Init ──────────────────────────────────────────────────
  window.addEventListener('scroll', onScroll, { passive: true });
  updateActiveLink();
  updateReadProgress();

  // Keyboard shortcut: '/' focuses first nav link
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      navLinks[0]?.focus();
    }
  });
})();
