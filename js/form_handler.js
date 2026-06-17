/**
 * form_handler.js
 * Handles contact form + product enquiry modal form submissions.
 * On submit: (1) emails pat@harmonyif.com via Apps Script,
 *            (2) opens WhatsApp with a pre-filled summary so the
 *                customer can also message the team directly.
 */

const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzM98Vkzq68Iow0ZzbMeqW0e5fP8k0U7g0-197-GVmYWGU3wwyxN_wv1XZqamp75LuT/exec';
const WA_NUMBER     = '6587953309';

/**
 * Builds a WhatsApp deep link pre-filled with the enquiry details.
 */
function buildWaUrl(data) {
  const lines = [
    `Hi Harmony, I just submitted an enquiry on your website:`,
    ``,
    `Name: ${data.name || '-'}`,
    data.company ? `Company: ${data.company}` : null,
    data.products ? `Product(s): ${data.products}` : null,
    data.volume ? `Est. Volume: ${data.volume}` : null,
    `Could you follow up with a quote?`,
  ].filter(Boolean).join('\n');

  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
}

/**
 * submitForm — POSTs form data to Apps Script (email), then opens
 * WhatsApp in a new tab with the same details pre-filled.
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

    // Open WhatsApp with a pre-filled summary in a new tab.
    const waUrl = buildWaUrl(data);
    window.open(waUrl, '_blank');

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