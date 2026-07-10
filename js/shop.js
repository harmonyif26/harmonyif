/* ============================================================
   SHOP.JS — B2C storefront rendering (separate from B2B products.js)
   Reuses: loadProducts(), CATEGORIES, getDemoRetailPrice() from products.js
   Reuses: addToCart() etc. from cart.js
   ============================================================ */

let SHOP_PRODUCTS = [];
let SHOP_ACTIVE_CAT = 'all';
let SHOP_SEARCH = '';

function shopApplyFilters(products) {
  let list = SHOP_ACTIVE_CAT === 'all' ? products : products.filter(p => p.category === SHOP_ACTIVE_CAT);
  if (SHOP_SEARCH) {
    const q = SHOP_SEARCH.toLowerCase();
    list = list.filter(p => p.nameEN.toLowerCase().includes(q) || p.nameCN.includes(SHOP_SEARCH));
  }
  return list;
}

function shopRenderFilterBar() {
  const bar = document.getElementById('shop-filter-btns');
  if (!bar) return;
  bar.innerHTML = CATEGORIES.map(cat => `
    <button class="filter-btn ${SHOP_ACTIVE_CAT === cat.id ? 'active' : ''}" onclick="shopFilter('${cat.id}')">${cat.labelEN}</button>
  `).join('');
}

function shopRenderGrid() {
  const grid = document.getElementById('shop-grid');
  const count = document.getElementById('shop-count');
  if (!grid) return;

  const list = shopApplyFilters(SHOP_PRODUCTS);
  if (count) count.textContent = `${list.length} product${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    grid.innerHTML = `<div class="products__empty"><p>No products match your search.</p></div>`;
    return;
  }

  grid.innerHTML = list.map((p, idx) => {
    const slug = encodeURIComponent(p.nameEN);
    const price = getDemoRetailPrice(p);
    const nameEsc = p.nameEN.replace(/'/g, "\\'");
    const imgHTML = p.imageUrl
      ? `<img class="product-card__image" src="${p.imageUrl}" alt="${p.nameEN}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const placeholderStyle = p.imageUrl ? 'display:none;' : '';

    return `
      <div class="product-card">
        <a href="shop-detail.html?product=${slug}" style="display:block;color:inherit;text-decoration:none;">
          <div class="product-card__image-wrap">
            ${imgHTML}
            <div class="product-card__placeholder" style="${placeholderStyle}"><span>Photo coming soon</span></div>
            ${p.origin ? `<div class="product-card__tag">${p.origin}</div>` : ''}
          </div>
          <div class="product-card__body" style="padding-bottom:0;">
            <p class="product-card__origin">${p.nameCN}</p>
            <h3 class="product-card__name">${p.nameEN}</h3>
            <div class="b2c-price-tag">$${price.toFixed(2)}<span style="font-size:0.65rem;color:var(--stone);font-weight:400;"> / ${p.uom || 'pkt'}</span></div>
          </div>
        </a>
        <div class="product-card__body" style="padding-top:0.6rem;">
          <div class="b2c-add-row">
            <div class="b2c-qty-stepper">
              <button type="button" onclick="const i=this.nextElementSibling;i.value=Math.max(1,(parseInt(i.value)||1)-1);">−</button>
              <input type="number" min="1" value="1" id="shop-qty-${idx}">
              <button type="button" onclick="const i=this.previousElementSibling;i.value=(parseInt(i.value)||1)+1;">+</button>
            </div>
            <button class="b2c-add-btn" onclick="
              const q=document.getElementById('shop-qty-${idx}').value;
              addToCart('${slug}','${nameEsc}',${price},q,'${p.uom || 'pkt'}');
              this.textContent='Added ✓';this.classList.add('added');
              setTimeout(()=>{this.textContent='Add to Cart';this.classList.remove('added');},1200);
            ">Add to Cart</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function shopFilter(cat) {
  SHOP_ACTIVE_CAT = cat;
  shopRenderFilterBar();
  shopRenderGrid();
}
function shopSearch(term) {
  SHOP_SEARCH = term;
  shopRenderGrid();
}

async function shopInit() {
  SHOP_PRODUCTS = await loadProducts();
  shopRenderFilterBar();
  shopRenderGrid();
}
document.addEventListener('DOMContentLoaded', shopInit);
