/**
 * form_handler.js
 * Shared form submission logic for contact.html and products.html (modal).
 * Include this as <script src="js/form_handler.js"></script> on both pages,
 * AFTER main.js and lang.js.
 *
 * Replace PASTE_YOUR_APPS_SCRIPT_URL_HERE with your deployed Apps Script URL.
 * It looks like: https://script.google.com/macros/s/XXXXXXXXXXXX/exec
 */

const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzM98Vkzq68Iow0ZzbMeqW0e5fP8k0U7g0-197-GVmYWGU3wwyxN_wv1XZqamp75LuT/exec';

/**
 * submitForm(formEl, btnEl, onSuccess, onError)
 * Generic handler — collects all named inputs, POSTs as JSON to Apps Script.
 */
async function submitForm(formEl, btnEl, onSuccess, onError) {
  const originalText = btnEl.textContent;
  btnEl.textContent  = 'Sending…';
  btnEl.disabled     = true;

  // Collect all named form fields into an object
  const data = {};
  new FormData(formEl).forEach((val, key) => { data[key] = val; });

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method:  'POST',
      // Apps Script requires no-cors OR we use a proxy trick.
      // mode: 'no-cors' means we can't read the response — but the script still runs.
      // We treat no network error = success.
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });

    // no-cors always returns opaque response — if we get here without throw, it worked
    onSuccess();

  } catch(err) {
    console.error('Form submission error:', err);
    btnEl.textContent = originalText;
    btnEl.disabled    = false;
    if (onError) onError(err);
  }
}

/* ── CONTACT PAGE FORM ─────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn        = document.getElementById('cf-submit');
    const successDiv = document.getElementById('form-success');

    submitForm(
      this,
      btn,
      () => {
        // Success
        contactForm.style.display = 'none';
        successDiv.style.display  = 'block';
      },
      () => {
        // Error
        btn.textContent = document.documentElement.getAttribute('data-lang') === 'cn'
          ? '发送失败，请重试'
          : 'Error — please try again';
      }
    );
  });
}

/* ── PRODUCTS PAGE MODAL FORM ──────────────────────────────── */
const modalForm = document.getElementById('modal-form');
if (modalForm) {
  modalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn        = document.getElementById('modal-submit');
    const successDiv = document.getElementById('modal-success');
    const lang       = document.documentElement.getAttribute('data-lang') || 'en';

    submitForm(
      this,
      btn,
      () => {
        // Success — hide all form groups, show success
        modalForm.querySelectorAll(
          '.form-group, .form-row, button[type=submit]'
        ).forEach(el => el.style.display = 'none');
        successDiv.style.display = 'block';
      },
      () => {
        btn.textContent = lang === 'cn' ? '发送失败，请重试' : 'Error — please try again';
      }
    );
  });
}