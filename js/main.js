/* ============================================================
   MAIN.JS — shared behaviour across all pages
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     NAV: scroll state
     Adds .nav--scrolled once user scrolls past 60px
  ---------------------------------------------------------- */
  const nav = document.querySelector('.nav');

  if (nav) {
    const SCROLL_THRESHOLD = 60;

    const updateNav = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        nav.classList.add('nav--scrolled');
        nav.classList.remove('nav--transparent');
      } else {
        nav.classList.remove('nav--scrolled');
        if (nav.classList.contains('nav--starts-transparent')) {
          nav.classList.add('nav--transparent');
        }
      }
    };

    // Run once on load in case page is already scrolled
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  /* ----------------------------------------------------------
     NAV: mobile hamburger menu
  ---------------------------------------------------------- */
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');
  const mobileLinks = document.querySelectorAll('.nav__mobile a');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when any link is clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ----------------------------------------------------------
     NAV: mark active page link
  ---------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav__links a, .nav__mobile a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ----------------------------------------------------------
     SCROLL REVEAL
     Watches elements with class .reveal using IntersectionObserver
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once only
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     SMOOTH ANCHOR SCROLLING
     Offset by nav height so headings aren't hidden behind nav
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
