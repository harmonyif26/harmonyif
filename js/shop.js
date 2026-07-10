/**
 * shop.js — Harmony Marketplace (B2C)
 * ─────────────────────────────────────────────────
 * STANDALONE from js/products.js (Wholesale/B2B catalogue).
 * This reads from its OWN Google Sheet tab, so Marketplace
 * products are managed completely separately from Wholesale.
 *
 * SHEET SETUP — Row 1 must have these exact headers, in this order:
 *   A: nameEN | B: nameCN | C: category | D: retailPrice | E: uom |
 *   F: packSize | G: origin | H: imageUrl | I: notes | J: stockStatus
 *
 * CATEGORY VALUES (column C) — must match one of these exactly:
 *   pork | beef | chicken | seafood | processed
 *
 * retailPrice (column D):
 *   A plain number, e.g. 12.50 — no "$" sign, no ranges.
 *
 * imageUrl (column H):
 *   Just the filename, e.g. pork-belly-slices.jpg
 *   Place the actual image file in images/marketplace/
 *
 * stockStatus (column J):
 *   in_stock | out_of_stock  (leave blank = treated as in_stock)
 *
 * TO GO LIVE:
 *   1. In your Google Sheet, create a tab named "Marketplace" with
 *      the headers above.
 *   2. File → Share → Publish to web → select the Marketplace tab →
 *      CSV → copy the URL.
 *   3. Paste it below into MARKETPLACE_CSV_URL.
 */

const MARKETPLACE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vStm-AyhhYvUYcmbjMd-xm02dSNK487xBUn6HZCuCK9D1-DukZvwzBvst12HATAybfTsvleS9cu4gT-/pub?gid=1318611931&single=true&output=csv'; // ← Marketplace Sheet, connected
const MARKETPLACE_IMAGE_PATH = 'images/marketplace/';

const MARKETPLACE_CATEGORIES = [
  { id: 'all',       labelEN: 'All Products'  },
  { id: 'pork',      labelEN: 'Pork'          },
  { id: 'beef',      labelEN: 'Beef & Lamb'   },
  { id: 'chicken',   labelEN: 'Chicken & Duck'},
  { id: 'seafood',   labelEN: 'Seafood'       },
  { id: 'processed', labelEN: 'Processed'     },
];

// ─────────────────────────────────────────────────
// DEMO FALLBACK — used until MARKETPLACE_CSV_URL is set.
// Replace/remove once your real Sheet is connected.
// ─────────────────────────────────────────────────
const MARKETPLACE_FALLBACK = [
  // nameEN | nameCN | category | retailPrice | uom | packSize | origin | imageUrl | notes | stockStatus
  ['Pork Belly Slices','猪五花肉片','pork',12.90,'pkt','500g','Brazil','','Great for hotpot or stir-fry.','in_stock'],
  ['Chicken Mid Wings','鸡中翼','chicken',8.50,'pkt','500g','Malaysia','','Marinate and grill, or fry up crispy.','in_stock'],
  ['Salmon Fillet','三文鱼片','seafood',15.90,'pkt','400g','Norway','','Skin-on, ready to pan-sear.','in_stock'],
  ['Beef Cubes','牛肉粒','beef',14.30,'pkt','500g','Australia','','Perfect for stews and curries.','in_stock'],
  ['Handmade Fishball','手工鱼丸','processed',6.50,'pkt','300g','Local','','Springy texture, great in soups.','in_stock'],
];

function marketplaceRowToProduct(r) {
  return {
    nameEN: r[0], nameCN: r[1], category: r[2], retailPrice: parseFloat(r[3]) || 0,
    uom: r[4], packSize: r[5], origin: r[6], imageUrl: r[7], notes: r[8],
    stockStatus: r[9] || 'in_stock'
  };
}

// ─────────────────────────────────────────────────
// CSV PARSER — handles quoted fields, commas inside quotes
// ─────────────────────────────────────────────────
function parseMarketplaceCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return null;
  const HEADERS = ['nameEN','nameCN','category','retailPrice','uom','packSize','origin','imageUrl','notes','stockStatus'];

  return lines.slice(1).map(line => {
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    const obj = {};
    HEADERS.forEach((h, i) => obj[h] = (cols[i] || '').replace(/^"|"$/g, '').trim());
    obj.category = obj.category.toLowerCase();
    obj.retailPrice = parseFloat(obj.retailPrice) || 0;
    obj.stockStatus = obj.stockStatus || 'in_stock';
    return obj;
  }).filter(p => p.nameEN);
}

async function loadMarketplaceProducts() {
  if (MARKETPLACE_CSV_URL) {
    try {
      const res = await fetch(MARKETPLACE_CSV_URL);
      const parsed = parseMarketplaceCSV(await res.text());
      if (parsed && parsed.length) return parsed;
    } catch (e) { console.warn('Marketplace Sheet fetch failed, using demo data.', e); }
  }
  return MARKETPLACE_FALLBACK.map(marketplaceRowToProduct);
}

function marketplaceImageUrl(p) {
  return p.imageUrl ? MARKETPLACE_IMAGE_PATH + p.imageUrl : '';
}

// ─────────────────────────────────────────────────
// STATE + RENDER
// ─────────────────────────────────────────────────
let SHOP_PRODUCTS = [];
let SHOP_ACTIVE_CAT = 'all';
let SHOP_SEARCH = '';

function shopApplyFilters(products) {
  let list = SHOP_ACTIVE_CAT === 'all' ? products : products.filter(p => p.category === SHOP_ACTIVE_CAT);
  if (SHOP_SEARCH) {
    const q = SHOP_SEARCH.toLowerCase();
    list = list.filter(p => p.nameEN.toLowerCase().includes(q) || p.nameCN.includes(SHOP_SEARCH));
  }
  return list.filter(p => p.stockStatus !== 'out_of_stock');
}

function shopRenderFilterBar() {
  const bar = document.getElementById('shop-filter-btns');
  if (!bar) return;
  bar.innerHTML = MARKETPLACE_CATEGORIES.map(cat => `
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
    const price = p.retailPrice;
    const nameEsc = p.nameEN.replace(/'/g, "\\'");
    const imgSrc = marketplaceImageUrl(p);
    const imgHTML = imgSrc
      ? `<img class="product-card__image" src="${imgSrc}" alt="${p.nameEN}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const placeholderStyle = imgSrc ? 'display:none;' : '';

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
  SHOP_PRODUCTS = await loadMarketplaceProducts();
  shopRenderFilterBar();
  shopRenderGrid();
}
document.addEventListener('DOMContentLoaded', shopInit);
