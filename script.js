(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ----------------------------------------------------------
     Theme toggle (persisted in localStorage)
     ---------------------------------------------------------- */
  var themeToggle = document.querySelector('.theme-toggle');

  function syncToggleState() {
    if (!themeToggle) return;
    var isDark = root.getAttribute('data-theme') === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  if (themeToggle) {
    syncToggleState();
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncToggleState();
    });
  }

  /* ----------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------- */
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav-links');
  var navLinks = document.querySelectorAll('.nav-links a');

  function closeMenu() {
    if (!nav || !menuButton) return;
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 860) closeMenu();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ----------------------------------------------------------
     Print / Download CV
     ---------------------------------------------------------- */
  document.querySelectorAll('[data-print]').forEach(function (btn) {
    btn.addEventListener('click', function () { window.print(); });
  });

  /* ----------------------------------------------------------
     Staggered reveal indices (children of grids)
     ---------------------------------------------------------- */
  document.querySelectorAll('.hero-stats, .project-grid, .skills-grid, .timeline').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.classList.add('stagger');
      child.style.setProperty('--i', i);
    });
  });

  /* ----------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ----------------------------------------------------------
     Active nav link based on section in view
     ---------------------------------------------------------- */
  var sections = document.querySelectorAll('main section[id]');
  var linkMap = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href');
    if (id && id.charAt(0) === '#') linkMap[id.slice(1)] = link;
  });

  if (sections.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkMap[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { threshold: 0.5, rootMargin: '-20% 0px -35% 0px' });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ----------------------------------------------------------
     Scroll progress bar (rAF-throttled)
     ---------------------------------------------------------- */
  var progressBar = document.getElementById('progressBar');
  if (progressBar) {
    var ticking = false;
    var updateProgress = function () {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = pct + '%';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(updateProgress); ticking = true; }
    }, { passive: true });
    updateProgress();
  }

  /* ----------------------------------------------------------
     Count-up on stats when the hero enters view
     ---------------------------------------------------------- */
  var statValues = document.querySelectorAll('.stat-value[data-count]');

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (prefersReducedMotion || target === 0) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var duration = 1400;
    var start = null;
    function tick(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(tick);
      else el.textContent = prefix + target + suffix;
    }
    window.requestAnimationFrame(tick);
  }

  if (statValues.length) {
    if (!('IntersectionObserver' in window)) {
      statValues.forEach(animateCount);
    } else {
      var countObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      statValues.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ----------------------------------------------------------
     Cursor spotlight on cards (fine pointers only)
     ---------------------------------------------------------- */
  if (finePointer && !prefersReducedMotion) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    });

    /* ------------------------------------------------------
       3D tilt on impact cards
       ------------------------------------------------------ */
    var MAX_TILT = 7;
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var raf = null;
      card.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            'rotateY(' + (px * MAX_TILT) + 'deg) rotateX(' + (-py * MAX_TILT) + 'deg) translateY(-4px)';
          raf = null;
        });
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------
     Current year in footer
     ---------------------------------------------------------- */
  var yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
})();
