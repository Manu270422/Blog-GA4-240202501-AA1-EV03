/**
 * main.js — Entry point: initialisation, utilities, tag interactions
 *
 * Carlos Manuel Turizo Hernández · GA4-240202501-AA1-EV03
 */

(function () {
  'use strict';

  // ── Tag → scroll to matching entry ───────────────────────
  const tags = document.querySelectorAll('.tag[data-target]');

  tags.forEach(tag => {
    tag.style.cursor = 'pointer';
    tag.setAttribute('role', 'button');
    tag.setAttribute('tabindex', '0');

    function activate() {
      const targetId = tag.dataset.target;
      const el = document.getElementById(targetId);
      if (!el) return;

      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Brief flash on the entry
      el.style.transition = 'background 0.2s';
      el.style.background = 'rgba(200,133,44,.07)';
      setTimeout(() => { el.style.background = ''; }, 800);
    }

    tag.addEventListener('click', activate);
    tag.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });

  // ── Progress pips: fill based on entry order ─────────────
  const allEntries = document.querySelectorAll('.entry');
  const total      = allEntries.length;

  allEntries.forEach((entry, index) => {
    const container = entry.querySelector('.progress-pip-row');
    if (!container) return;

    for (let i = 0; i < total; i++) {
      const pip = document.createElement('span');
      pip.className = 'progress-pip' + (i <= index ? ' filled' : '');
      container.appendChild(pip);
    }
  });

  // ── Smooth reading-time estimate ─────────────────────────
  const WORDS_PER_MIN = 200;

  document.querySelectorAll('.entry').forEach(entry => {
    const badge = entry.querySelector('.read-time-count');
    if (!badge) return;
    const text  = entry.innerText || entry.textContent || '';
    const words = text.trim().split(/\s+/).length;
    const mins  = Math.max(1, Math.round(words / WORDS_PER_MIN));
    badge.textContent = `${mins} min read`;
  });

  // ── Ambient parallax on cover shapes ─────────────────────
  const cover = document.querySelector('.cover');

  if (cover && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      cover.style.setProperty('--scroll-y', y + 'px');
    }, { passive: true });
  }

  // ── Accessibility: announce page section to screen readers ─
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const heading = entry.target.querySelector('h3');
        if (heading) {
          document.title = `${heading.textContent} — My English Journal`;
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.entry').forEach(el => observer.observe(el));

})();
