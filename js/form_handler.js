/**
 * form_handler.js
 * Handles contact form + product enquiry modal form submissions.
 * Posts to Google Apps Script endpoint which emails pat@harmonyif.com.
 */

const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzM98Vkzq68Iow0ZzbMeqW0e5fP8k0U7g0-197-GVmYWGU3wwyxN_wv1XZqamp75LuT/exec';

/**
 * submitForm — POSTs form data to Apps Script.
 * Apps Script uses doPost() with no CORS header, so we must use no-cors.
 * We fire-and-forget: if no network error, we treat it as success.
 */
async function submitForm(formEl, btnEl, onSuccess, onError) {
  const originalText = btnEl.textContent;
  btnEl.textContent  = 'Sending…';
  btnEl.disabled     = true;

  const data = { _source: window.location.pathname };
  new FormData(formEl).forEach((val, key) => { data[key] = val; });

  try {
    await fetch(FORM_ENDPOINT, {
      method:  'POST',
      mode:    'no-cors',   // Apps Script doesn't set CORS headers — fire & forget
      headers: { 'Content-Type': 'text/plain' }, // text/plain avoids preflight
      body:    JSON.stringify(data),
    });
    onSuccess();
  } catch (err) {
    console.error('Form submission error:', err);
    btnEl.textContent = originalText;
    btnEl.disabled    = false;
    if (onError) onError(err);
  }
}

/* ── CONTACT PAGE FORM ──────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn        = document.getElementById('cf-submit');
    const successDiv = document.getElementById('form-success');

    submitForm(
      this,
      btn,
      () => {
        contactForm.style.display = 'none';
        successDiv.style.display  = 'block';
      },
      () => {
        btn.textContent = document.documentElement.getAttribute('data-lang') === 'cn'
          ? '发送失败，请重试'
          : 'Error — please try again';
      }
    );
  });
}

/* ── PRODUCTS PAGE MODAL FORM ───────────────────────────────── */
const modalForm = document.getElementById('modal-form');
if (modalForm) {
  modalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn        = document.getElementById('modal-submit');
    const successDiv = document.getElementById('modal-success');
    const lang       = document.documentElement.getAttribute('data-lang') || 'en';

    submitForm(
      this,
      btn,
      () => {
        modalForm.querySelectorAll('.form-group, .form-row, button[type=submit]')
          .forEach(el => el.style.display = 'none');
        successDiv.style.display = 'block';
      },
      () => {
        btn.textContent = lang === 'cn' ? '发送失败，请重试' : 'Error — please try again';
      }
    );
  });
}
