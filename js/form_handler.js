/**
 * form_handler.js
 * Handles two separate flows:
 *  1. CONTACT PAGE FORM  → emails pat@harmonyif.com via Apps Script
 *  2. PRODUCT ENQUIRY MODAL (products.html / product-detail.html)
 *     → no email — opens WhatsApp directly with all entered
 *       fields pre-filled into the message.
 */

const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzM98Vkzq68Iow0ZzbMeqW0e5fP8k0U7g0-197-GVmYWGU3wwyxN_wv1XZqamp75LuT/exec';
const WA_NUMBER     = '6587953309';

/**
 * Builds a WhatsApp deep link with all enquiry fields pre-filled.
 */
function buildWaUrl(data) {
  const lines = [
    `Hi Harmony, I'd like to enquire:`,
    ``,
    `Name: ${data.name || '-'}`,
    data.company ? `Company: ${data.company}` : null,
    `Phone: ${data.phone || '-'}`,
    `Email: ${data.email || '-'}`,
    data.products ? `Product(s): ${data.products}` : null,
    data.volume ? `Est. Volume: ${data.volume}` : null,
    data.message ? `Notes: ${data.message}` : null,
    ``,
    `Could you follow up with a quote?`,
  ].filter(Boolean).join('\n');

  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
}

/**
 * submitToEmail — POSTs form data to Apps Script (email only).
 * Used by the contact page form.
 */
async function submitToEmail(formEl, btnEl, onSuccess, onError) {
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

/**
 * submitToWhatsApp — skips email entirely, opens WhatsApp directly
 * with all entered fields pre-filled. Used by the product enquiry modal.
 */
function submitToWhatsApp(formEl, onSuccess) {
  const data = { _source: window.location.pathname };
  new FormData(formEl).forEach((val, key) => { data[key] = val; });

  const waUrl = buildWaUrl(data);
  window.open(waUrl, '_blank');

  onSuccess();
}

/* ── CONTACT PAGE FORM (emails pat@harmonyif.com) ────────────── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn        = document.getElementById('cf-submit');
    const successDiv = document.getElementById('form-success');

    submitToEmail(
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

/* ── PRODUCT ENQUIRY MODAL (opens WhatsApp directly, no email) ── */
const modalForm = document.getElementById('modal-form');
if (modalForm) {
  modalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const successDiv = document.getElementById('modal-success');

    submitToWhatsApp(this, () => {
      modalForm.querySelectorAll('.form-group, .form-row, button[type=submit]')
        .forEach(el => el.style.display = 'none');
      successDiv.style.display = 'block';
    });
  });
}