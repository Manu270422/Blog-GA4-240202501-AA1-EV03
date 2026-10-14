/**
 * animations.js — Scroll-reveal, pen trail, page-load progress,
 *                 and ink-drop entry transitions
 *
 * Carlos Manuel Turizo Hernández · GA4-240202501-AA1-EV03
 */

(function () {
  'use strict';

  // Respect reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Page-load top progress bar ────────────────────────────
  const bar = document.getElementById('page-progress');

  if (bar) {
    let fakeProgress = 0;
    const fakeTimer = setInterval(() => {
      fakeProgress += Math.random() * 14;
      if (fakeProgress >= 85) { clearInterval(fakeTimer); fakeProgress = 85; }
      bar.style.width = fakeProgress + '%';
    }, 120);

    window.addEventListener('load', () => {
      clearInterval(fakeTimer);
      bar.style.width = '100%';
      setTimeout(() => { bar.style.opacity = '0'; }, 400);
    });
  }

  // ── Scroll-reveal (IntersectionObserver) ─────────────────
  if (!prefersReduced) {
    const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(el => observer.observe(el));
    } else {
      // Fallback: show all
      revealEls.forEach(el => el.classList.add('visible'));
    }
  }

  // ── Pen / ink trail canvas ────────────────────────────────
  const canvas = document.getElementById('trail-canvas');

  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let points = [];
    let mouse  = { x: -200, y: -200 };
    let raf;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function onMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      points.push({ x: mouse.x, y: mouse.y, life: 1 });
      if (points.length > 32) points.shift();
    }

    function drawTrail() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      points = points.filter(p => p.life > 0.02);
      points.forEach((p, i) => {
        p.life *= 0.88;
      });

      if (points.length < 2) {
        raf = requestAnimationFrame(drawTrail);
        return;
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length - 1; i++) {
        const mx = (points[i].x + points[i + 1].x) / 2;
        const my = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
      }

      ctx.strokeStyle = 'rgba(200, 133, 44, 0.28)';
      ctx.lineWidth   = 2.2;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.stroke();

      // Ink dot at tip
      if (points.length > 0) {
        const tip = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 133, 44, ${tip.life * 0.5})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(drawTrail);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    raf = requestAnimationFrame(drawTrail);

    // Touch trail
    window.addEventListener('touchmove', e => {
      const t = e.touches[0];
      mouse.x = t.clientX;
      mouse.y = t.clientY;
      points.push({ x: mouse.x, y: mouse.y, life: 1 });
      if (points.length > 20) points.shift();
    }, { passive: true });
  }

  // ── Entry in-view highlight ───────────────────────────────
  const entries = document.querySelectorAll('.entry');

  if ('IntersectionObserver' in window && !prefersReduced) {
    const entryObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    }, { threshold: 0.15 });

    entries.forEach(el => entryObs.observe(el));
  }

})();
