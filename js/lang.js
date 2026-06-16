/**
 * lang.js — Bilingual EN / 中文 toggle
 * Shared across all pages. Include BEFORE main.js and any page scripts.
 *
 * HOW IT WORKS:
 * - Add data-en="English" data-cn="中文" to any element
 * - Call setLanguage('en') or setLanguage('cn') to switch
 * - Language is saved in localStorage and applied on every page load
 *
 * USAGE IN HTML:
 *   <span data-en="Products" data-cn="产品">Products</span>
 *   <a data-en="Home" data-cn="首页">Home</a>
 *   <h2 data-en="What We Supply" data-cn="我们的供应">What We Supply</h2>
 */

const LANG_KEY = 'harmony_lang';

function setLanguage(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  localStorage.setItem(LANG_KEY, lang);

  // Swap all labelled elements
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'cn' ? (el.dataset.cn || el.dataset.en) : el.dataset.en;
  });

  // Update toggle button states
  document.querySelectorAll('.lang-toggle__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function initLanguage() {
  const saved = localStorage.getItem(LANG_KEY) || 'en';
  // Apply without animation flash — set attribute first, then swap text
  document.documentElement.setAttribute('data-lang', saved);
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setLanguage(saved));
  } else {
    setLanguage(saved);
  }
}

initLanguage();