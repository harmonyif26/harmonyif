/* ============================================================
   CART.JS — Prototype B2C shopping cart engine
   ------------------------------------------------------------
   PROTOTYPE NOTE: This is a frontend-only demo. Cart state lives
   in localStorage on the customer's browser. No payment, no
   server-side order record yet — that's Phase 1 backend work
   (Apps Script + HitPay), not built in this prototype.
   ============================================================ */

const CART_STORAGE_KEY = 'harmony_b2c_cart_v1';
const CART_MIN_ORDER    = 60; // SGD — minimum order value

/* ---------- state ---------- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (e) { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  renderCartDrawer();
  updateCartBadge();
}

function addToCart(id, name, price, qty, uom) {
  qty = Math.max(1, parseInt(qty) || 1);
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id, name, price, qty, uom: uom || 'pkt' });
  saveCart(cart);
  openCart();
}

function updateCartQty(id, qty) {
  qty = parseInt(qty) || 0;
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  } else {
    const item = cart.find(i => i.id === id);
    if (item) item.qty = qty;
  }
  saveCart(cart);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function clearCart() {
  saveCart([]);
}

function getSubtotal() {
  const sum = getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
  return Math.round(sum * 100) / 100; // avoid floating point artifacts like 60.599999999999994
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

/* ---------- delivery date helper ----------
   Rule: T+1 WORKING day. Order placed today (a working day) ->
   earliest delivery is the next working day (Mon-Fri, no SG
   public holiday check yet — flag for later since that needs a
   holiday calendar). Ordering on Fri/Sat/Sun -> earliest Monday
   is same-day-of-week logic below already handles via skipping
   Sat/Sun; public holidays would need an explicit list.
------------------------------------------------------------- */
function getEarliestDeliveryDate() {
  const d = new Date();
  let added = 0;
  while (added < 1) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay(); // 0 = Sun, 6 = Sat
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}
function formatDeliveryDate(d) {
  return d.toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' });
}

/* ---------- badge ---------- */
function updateCartBadge() {
  const badge = document.getElementById('cart-fab-badge');
  const count = getCartCount();
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

/* ---------- drawer render ---------- */
function renderCartDrawer() {
  const body = document.getElementById('cart-drawer-body');
  const footer = document.getElementById('cart-drawer-footer');
  if (!body || !footer) return;

  const cart = getCart();
  const lang = document.documentElement.getAttribute('data-lang') || 'en';

  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty">
      <p>${lang === 'cn' ? '购物车是空的' : 'Your cart is empty'}</p>
    </div>`;
    footer.innerHTML = '';
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-line">
      <div class="cart-line__info">
        <p class="cart-line__name">${item.name}</p>
        <p class="cart-line__price">$${item.price.toFixed(2)} / ${item.uom}</p>
      </div>
      <div class="cart-line__qty">
        <button onclick="updateCartQty('${item.id}', ${item.qty - 1})" aria-label="Decrease quantity">−</button>
        <span>${item.qty}</span>
        <button onclick="updateCartQty('${item.id}', ${item.qty + 1})" aria-label="Increase quantity">+</button>
      </div>
      <button class="cart-line__remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">✕</button>
    </div>
  `).join('');

  const subtotal = getSubtotal();
  const meetsMin = subtotal >= CART_MIN_ORDER;

  footer.innerHTML = `
    <div class="cart-subtotal">
      <span>${lang === 'cn' ? '小计' : 'Subtotal'}</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    ${!meetsMin ? `<p class="cart-min-warning">
        ${lang === 'cn' ? '还差' : 'Add'} $${(CART_MIN_ORDER - subtotal).toFixed(2)} ${lang === 'cn' ? '即可下单（最低订购 $60）' : 'more to reach the $60 minimum order'}
      </p>` : ''}
    <button class="btn btn-primary cart-checkout-btn" ${!meetsMin ? 'disabled' : ''} onclick="window.location.href='checkout.html'">
      ${lang === 'cn' ? '结账' : 'Checkout'}
    </button>
  `;
}

/* ---------- open/close ---------- */
function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
function toggleCart() {
  const isOpen = document.getElementById('cart-drawer').classList.contains('open');
  isOpen ? closeCart() : openCart();
}

/* ---------- inject drawer markup + floating button into every page ---------- */
function injectCartUI() {
  if (document.getElementById('cart-drawer')) return; // already injected

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="cart-overlay" id="cart-overlay" onclick="closeCart()"></div>
    <aside class="cart-drawer" id="cart-drawer">
      <div class="cart-drawer__header">
        <h3>Your Cart</h3>
        <button onclick="closeCart()" aria-label="Close cart">✕</button>
      </div>
      <div class="cart-drawer__body" id="cart-drawer-body"></div>
      <div class="cart-drawer__footer" id="cart-drawer-footer"></div>
    </aside>
    <button class="cart-fab" id="cart-fab" onclick="toggleCart()" aria-label="Open cart">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <span class="cart-fab__badge" id="cart-fab-badge">0</span>
    </button>
  `;
  document.body.appendChild(wrap);
  renderCartDrawer();
  updateCartBadge();
}

document.addEventListener('DOMContentLoaded', () => {
  injectCartUI();
  updateCartBadge();
});
