/* ============================================================
   GÎTE DE DEUX EAUX — Main JS (vanilla, no dependencies)
   ============================================================ */

'use strict';

/* ===== NAV ===== */
(function () {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
})();

/* ===== HERO SLIDESHOW ===== */
(function () {
  const slides = document.querySelectorAll('.hero__slide');
  const dots = document.querySelectorAll('.hero__dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function next() { goTo(current + 1); }

  function start() { timer = setInterval(next, 4500); }
  function stop() { clearInterval(timer); }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stop(); goTo(i); start(); });
  });

  // Pause on hover
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
  }

  start();
})();

/* ===== LIGHTBOX ===== */
(function () {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  const lbImg = lb.querySelector('.lightbox__img');
  const lbCaption = lb.querySelector('.lightbox__caption');
  const lbClose = lb.querySelector('.lightbox__close');
  const lbPrev = lb.querySelector('.lightbox__prev');
  const lbNext = lb.querySelector('.lightbox__next');

  let items = [];
  let current = 0;

  function open(idx) {
    current = idx;
    show();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function show() {
    const item = items[current];
    if (!item) return;
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    if (lbCaption) lbCaption.textContent = item.caption || item.alt || '';
  }

  function prev() { current = (current - 1 + items.length) % items.length; show(); }
  function next() { current = (current + 1) % items.length; show(); }

  // Collect gallery items
  document.querySelectorAll('.gallery__item').forEach((el, i) => {
    const img = el.querySelector('img');
    if (!img) return;

    // Use data-full or data-src for high-res, fallback to img src
    const src = el.dataset.full || img.dataset.src || img.src;
    items.push({ src, alt: img.alt, caption: img.dataset.caption || img.alt });

    el.addEventListener('click', () => open(i));
  });

  lbClose?.addEventListener('click', close);
  lbPrev?.addEventListener('click', prev);
  lbNext?.addEventListener('click', next);

  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();

/* ===== GALLERY LOAD MORE ===== */
(function () {
  const btn = document.getElementById('galleryMore');
  const hidden = document.querySelector('.gallery__hidden');
  if (!btn || !hidden) return;

  btn.addEventListener('click', () => {
    hidden.classList.add('shown');
    btn.closest('.gallery__more')?.remove();

    // Re-index lightbox items after showing hidden
    // Trigger a re-scan (lightbox already handles all .gallery__item on load)
  });
})();

/* ===== SCROLL TO TOP ===== */
(function () {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ===== INTERSECTION OBSERVER (fade-up animations) ===== */
(function () {
  if (!window.IntersectionObserver) return;

  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();

/* ===== SMOOTH SCROLL (anchor links) ===== */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ===== ACTIVE NAV LINK ===== */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === page || (page === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });
})();

/* ===== PAGE NAV BAR ACTIVE ===== */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.page-nav-bar__links a');
  if (!navLinks.length || !sections.length) return;

  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.page-nav-bar__links a[href="#${e.target.id}"]`);
        link?.classList.add('active');
      }
    });
  }, { rootMargin: `-${navH + 48}px 0px -60% 0px` });

  sections.forEach(s => io.observe(s));
})();

/* ===== CONTACT FORM — construit un mailto: sans serveur PHP ===== */
(function () {
  const forms = document.querySelectorAll('form[action^="mailto:"]');

  forms.forEach(form => {
    const email = form.action.replace('mailto:', '').split('?')[0];

    form.addEventListener('submit', e => {
      e.preventDefault();

      // Collecte tous les champs renseignés
      const data = new FormData(form);
      const lines = [];
      data.forEach((val, key) => {
        if (val.trim()) lines.push(`${key}: ${val}`);
      });

      const subject = encodeURIComponent('Demande de séjour — Gîte de Deux Eaux');
      const body    = encodeURIComponent(lines.join('\n'));
      const href    = `mailto:${email}?subject=${subject}&body=${body}`;

      // Ouvre le client mail
      window.location.href = href;

      // Feedback visuel
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Client mail ouvert ✓';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 4000);
      }
    });
  });
})();
