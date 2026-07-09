/**
 * products.js — Harmony International Food Pte Ltd
 * ─────────────────────────────────────────────────
 * DATA SOURCE: Google Sheets (published as CSV)
 *
 * SHEET SETUP — Row 1 must have these exact headers:
 *   A: nameEN | B: nameCN | C: category | D: uom | E: packSize
 *   F: priceRange | G: moq | H: origin | I: imageUrl | J: notes
 *
 * CATEGORY VALUES (column C):
 *   pork | beef | chicken | seafood | processed
 *
 * IMAGE URLS (column I):
 *   Upload to Google Drive → share "Anyone with link"
 *   Use: https://lh3.googleusercontent.com/d/YOUR_FILE_ID
 *
 * TO GO LIVE:
 *   1. File → Share → Publish to web → CSV → copy URL
 *   2. Paste below into SHEETS_CSV_URL
 */

const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vStm-AyhhYvUYcmbjMd-xm02dSNK487xBUn6HZCuCK9D1-DukZvwzBvst12HATAybfTsvleS9cu4gT-/pub?gid=0&single=true&output=csv'; // ← PASTE YOUR GOOGLE SHEETS CSV URL HERE

// ─────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',       labelEN: 'All Products'  },
  { id: 'pork',      labelEN: 'Pork'          },
  { id: 'beef',      labelEN: 'Beef & Lamb'   },
  { id: 'chicken',   labelEN: 'Chicken & Duck'},
  { id: 'seafood',   labelEN: 'Seafood'       },
  { id: 'processed', labelEN: 'Processed'     },
];

// ─────────────────────────────────────────────────
// FALLBACK DATA — used until Sheets URL is set
// All fields match the sheet column order exactly
// ─────────────────────────────────────────────────
const FALLBACK = [
  // nameEN | nameCN | category | uom | packSize | priceRange | moq | origin | imageUrl | notes
  ['Pork Front Leg','猪前腿肉','pork','KG','','','','','',''],
  ['Pork Hind Leg','猪后腿肉','pork','KG','','','','','',''],
  ['Pork Belly','猪五花肉','pork','KG','','','','','',''],
  ['Pork Boneless Loin','猪肉头','pork','KG','','','','','',''],
  ['Pork Skinless Belly','猪三层肉','pork','KG','','','','','',''],
  ['Pork Skinless Belly Slice 3mm','2kg 猪三层肉片','pork','KG','2kg / Pkt','','','','',''],
  ['Pork Skinless Belly Slice 3mm','4.5kg 猪三层肉片','pork','KG','4.5kg / Pkt','','','','',''],
  ['Pork Skinless Belly','猪无皮三层肉','pork','KG','','','','','',''],
  ['Pork Mince','猪肉碎','pork','KG','','','','','',''],
  ['Pork Slice 3mm','猪肉片','pork','KG','','','','','',''],
  ['Pork Diced','猪肉丁','pork','KG','','','','','',''],
  ['Pork Shredded 6.5mm','6.5mm 猪肉丝','pork','KG','','','','','',''],
  ['Pork Shredded 5mm','5mm 猪肉丝','pork','KG','','','','','',''],
  ['Pig Ear Slice','猪耳片','pork','KG','','','','','',''],
  ['Pig Ear','猪耳朵','pork','KG','','','','','',''],
  ['Pig Tongue','猪舌','pork','KG','','','','','',''],
  ['Pork Liver','猪肝','pork','KG','10kg / Ctn','','','','',''],
  ['Pork Liver Slice','猪肝片','pork','KG','10kg / Ctn','','','','',''],
  ['Pork Kidney','猪腰','pork','KG','10kg / Ctn','','','','',''],
  ['Pork Cooked / Raw Stomach','猪肚 热/生','pork','KG','10kg / Ctn','','','','',''],
  ['Pork Cooked Chitterling','猪大肠 热','pork','KG','10kg / Ctn','','','','',''],
  ['Pork Cooked Chitterling Head','猪大肠头','pork','KG','10kg / Ctn','','','','',''],
  ['Special Pork Cooked Chitterling Head','特价猪大肠头','pork','KG','10kg / Ctn','','','','',''],
  ['Pork Fats','猪油','pork','KG','10kg / Ctn','','','','',''],
  ['Pork Fats Diced','猪油粒','pork','KG','2kg / Pkt','','','','',''],
  ['Pork Fats Mince','猪油碎','pork','KG','2kg / Pkt','','','','',''],
  ['Pig Tails','猪尾','pork','KG','','','','','',''],
  ['Fresh Pork Meaty Humerous Bone','鲜肉猪多大骨','pork','KG','','','','','',''],
  ['Pork Humerous Bone','猪酱大骨','pork','KG','','','','','',''],
  ['Pork Skin','猪皮','pork','KG','','','','','',''],
  ['Pork Trotter','猪元蹄','pork','KG','','','','','',''],
  ['Pork Front Feet','猪手尖','pork','KG','','','','','',''],
  ['Pork Riblets','猪三角排','pork','KG','','','','','',''],
  ['Pork Soft Bone','猪软骨','pork','KG','','','','','',''],
  ['Pork Spare Ribs','猪肋排','pork','KG','','','','','',''],
  ['Pork Throat','猪喉管','pork','KG','','','','','',''],
  ['Special Pork Throat','特价猪喉管','pork','KG','','','','','',''],
  ['Pork Skirt','猪护心肉','pork','KG','','','','','',''],
  ['Pork Cartilage / Soft Bone','猪劲骨','pork','KG','','','','','',''],
  ['Pork St. Louis Spare Ribs','子弹排','pork','KG','','','','','',''],
  ['Pig Brain','猪脑','pork','KG','','','','','',''],
  ['Pork Head Skin with Bone','带骨猪头皮','pork','KG','','','','','',''],
  ['Special Spare Ribs Ends','特价肋排切块','pork','KG','','','','','',''],
  // BEEF & LAMB
  ['Beef Omasum Bleach','牛百叶（白）','beef','KG','','','','','',''],
  ['Beef Omasum Black','牛百叶（黑）','beef','KG','','','','','',''],
  ['Beef Slice','牛肉片','beef','KG','','','','','',''],
  ['Beef Mince','牛肉碎','beef','KG','','','','','',''],
  ['Beef Knuckle','牛后腿肉','beef','KG','','','','','',''],
  ['Beef Shank','牛腱肉','beef','KG','','','','','',''],
  ['Beef Shank Diced','牛腱丁（片）','beef','KG','','','','','',''],
  ['Beef Golden Coin Shank','金钱牛腱','beef','KG','','','','','',''],
  ['Beef Brisket','牛腩','beef','KG','','','','','',''],
  ['Beef Tendon','牛蹄筋','beef','KG','','','','','',''],
  ['Beef Back Tendon','牛板筋','beef','KG','','','','','',''],
  ['Beef Tripe','牛肚','beef','KG','','','','','',''],
  ['Beef Honeycomb','金钱牛肚','beef','KG','','','','','',''],
  ['Beef Big Bone','牛大骨','beef','KG','','','','','',''],
  ['Beef Tail','牛尾','beef','KG','','','','','',''],
  ['US Short Plate','美国肥牛','beef','KG','','','','USA','',''],
  ['Karubi Plate','日式肥牛','beef','KG','','','','','',''],
  ['Beef Throat','牛喉管','beef','KG','','','','','',''],
  ['Beef Shoulder','牛臂尖','beef','KG','','','','','',''],
  ['Beef Eye Round','黄瓜牛肉','beef','KG','','','','','',''],
  ['Beef Brisket (Flag Bone)','旗骨牛腩','beef','KG','','','','','',''],
  ['Beef Cuberoll / Ribeye','巴西牛肋眼','beef','KG','','','','Brazil','',''],
  ['Beef Striploin','巴西西冷','beef','KG','','','','Brazil','',''],
  ['Beef Fats','牛油','beef','KG','','','','','',''],
  ['Beef Rib Fingers','牛肋条','beef','KG','','','','','',''],
  ['Beef Chuck','牛上脑','beef','KG','','','','','',''],
  ['Beef Bone In Short Ribs','牛仔骨','beef','KG','','','','','',''],
  ['Mutton Ribs','羊排','beef','KG','','','','','',''],
  ['Mutton Stomach','羊肚','beef','KG','','','','','',''],
  ['Mutton Leg','羊腿肉','beef','KG','','','','','',''],
  ['Lamb Boneless Leg','羔羊腿肉','beef','KG','','','','','',''],
  ['Lamb Leg Roll','羔羊腿肉卷','beef','KG','','','','','',''],
  ['Lamb Slice','羊肉片','beef','KG','','','','','',''],
  ['Lamb Spine Cut','羊蝎子（羊脊骨）','beef','KG','','','','','',''],
  ['Lamb Rack','羊排肉','beef','KG','','','','','',''],
  ['Lamb Kidney','羊腰子','beef','KG','','','','','',''],
  ['Lamb Boneless Shoulder','鲜羊上脑','beef','KG','','','','','',''],
  // CHICKEN & DUCK
  ['Chicken Bone-In Leg','鸡大腿','chicken','KG','15kg / Ctn','','','','',''],
  ['Chicken Thigh','鸡上腿','chicken','KG','15kg / Ctn','','','','',''],
  ['Chicken Tips','鸡翅根','chicken','KG','15kg / Ctn','','','','',''],
  ['Chicken Wings','鸡全翅','chicken','KG','15kg / Ctn','','','','',''],
  ['Chicken Mid-Joint Wings 35-40g','鸡中翅','chicken','KG','1kg / Pkt','','','','',''],
  ['Chicken Mid-Joint Wings 50g up','鸡中翅','chicken','KG','2.5kg / Pkt','','','','',''],
  ['Chicken Gizzards','鸡胗','chicken','KG','15kg / Ctn','','','','',''],
  ['Chicken Boneless Leg','鸡扒 / 去骨带皮鸡腿肉','chicken','KG','15kg / Ctn','','','','',''],
  ['Chicken Claws','凤爪','chicken','KG','15kg / Ctn','','','','',''],
  ['Chicken Feet','鸡脚','chicken','KG','15kg / Ctn','','','','',''],
  ['Chicken Boneless Breast','鸡胸肉（无皮）','chicken','KG','2kg / Pkt','','','','',''],
  ['Chicken Mince','鸡肉碎','chicken','KG','2kg / Pkt','','','','',''],
  ['Chicken Diced','鸡肉丁','chicken','KG','2kg / Pkt','','','','',''],
  ['Chicken Slice','鸡肉片','chicken','KG','2kg / Pkt','','','','',''],
  ['Spring / Poussin Chicken','童子鸡 1.2kg','chicken','PC','','','','','',''],
  ['Spent Hen','老母鸡（1.3kg/只）','chicken','PC','','','','','',''],
  ['Kampung Chicken','山芭鸡','chicken','PC','','','','','',''],
  ['Black / Silkie Chicken','乌鸡','chicken','PC','','','','','',''],
  ['Chicken Skin','鸡皮','chicken','KG','','','','','',''],
  ['Chicken Head','鸡头','chicken','KG','','','','','',''],
  ['Chicken Fats','鸡油','chicken','KG','','','','','',''],
  ['Chicken Cartilage','鸡股软骨','chicken','KG','','','','','',''],
  ['Chicken Carcass / Frame','鸡骨架','chicken','KG','','','','','',''],
  ['Duck Gizzards','鸭胗','chicken','KG','','','','','',''],
  ['Duck Necks','鸭脖','chicken','KG','','','','','',''],
  ['Duck Feet / Webs','鸭脚','chicken','KG','','','','','',''],
  ['Duck 3-Joint Wings','鸭三节翅','chicken','KG','','','','','',''],
  ['Duck Head','鸭头','chicken','KG','','','','','',''],
  ['Whole Duck','全鸭（2kg/只）','chicken','PC','','','','','',''],
  // SEAFOOD
  ['Vannamei PDTO Tail-On Shrimp (16/20)','凤尾虾（16/20）','seafood','KG','','','','','',''],
  ['Vannamei PDTO Tail-On Shrimp (21/25)','凤尾虾（21/25）','seafood','KG','','','','','',''],
  ['Vannamei PDTO Tail-On Shrimp (26/30)','凤尾虾（26/30）','seafood','KG','','','','','',''],
  ['Vannamei PDTO Tail-On Shrimp (31/40)','凤尾虾（31/40）','seafood','KG','','','','','',''],
  ['Vannamei PDTO Tail-On Shrimp (41/50)','凤尾虾（41/50）','seafood','KG','','','','','',''],
  ['Vannamei PDTO Tail-On Shrimp (51/60)','凤尾虾（51/60）','seafood','KG','','','','','',''],
  ['Green Prawns (21/25)','青虾（21/25）','seafood','KG','','','','','',''],
  ['Green Prawns (26/30)','青虾（26/30）','seafood','KG','','','','','',''],
  ['Shrimp Meat (31/40)','虾仁（31/40）','seafood','KG','','','','','',''],
  ['Shrimp Meat (41/50)','虾仁（41/50）','seafood','KG','','','','','',''],
  ['Shrimp Meat (71/90)','虾仁（71/90）','seafood','KG','','','','','',''],
  ['Tiger Prawn Meat (31/40)','天然老虎虾仁（31/40）','seafood','KG','','','','','',''],
  ['Cooked Prawn (41/50)','热虾（41/50）','seafood','KG','','','','','',''],
  ['Head Off Squid','无头苏东','seafood','KG','','','','','',''],
  ['Squid Flower','苏东花','seafood','KG','','','','','',''],
  ['Squid Rings','苏东圈','seafood','KG','','','','','',''],
  ['Abalone Squid Slice','贵妃鲍片','seafood','KG','','','','','',''],
  ['Squid Tentacles / Calamari','冰冻鱿鱼须','seafood','KG','','','','','',''],
  ['Abalone Kushiyaki','鲍鱼串','seafood','KG','','','','','',''],
  ['Squid Beak / Mouth Skewers','龙珠串','seafood','KG','','','','','',''],
  ['Jumbo Whole Squid','整只大鱿鱼','seafood','KG','','','','','',''],
  ['Butterfly Cut Fish 850-950g','开背鱼 850-950g','seafood','KG','10kg / Ctn','','','','',''],
  ['Butterfly Cut Fish 800-1000g','开背鱼 800-1000g','seafood','KG','10kg / Ctn','','','','',''],
  ['Dory Fish Fillet 170/220up','多利鱼 170/220up','seafood','KG','6kg / Ctn','','','','',''],
  ['Dory Fish Fillet 220up','多利鱼 220up','seafood','KG','6kg / Ctn','','','','',''],
  ['Dory Fish Fillet 300up','多利鱼 300up','seafood','KG','7kg / Ctn','','','','',''],
  ['Hairtail / Ribbon Fish','带鱼','seafood','KG','','','','','',''],
  ['Saba Fish (400-600g)','沙巴鱼（400-600g）','seafood','KG','','','','','',''],
  ['Salmon Fillet','三文鱼柳','seafood','KG','','','','','',''],
  ['Scallops Meat','扇贝肉','seafood','KG','','','','','',''],
  ['Half Shell Scallops','扇贝','seafood','KG','','','','','',''],
  ['White Clam (40/60)','白蛤','seafood','KG','','','','','',''],
  ['Flower Clam (30/40)','花蛤','seafood','KG','','','','','',''],
  ['Black Mussel (40/60)','青口贝','seafood','KG','','','','','',''],
  ['China Mussel 907g/box','中国青口贝','seafood','KG','7 boxes / Ctn','','','China','',''],
  // PROCESSED & HOTPOT
  ['Seaweed Chicken','蔡菜鸡','processed','KG','','','','','',''],
  ['Cheese Tofu','芝士豆腐','processed','KG','','','','','',''],
  ['Seafood Tofu','海鲜豆腐','processed','KG','','','','','',''],
  ['Taiwan Pork Sausage','台湾香肠','processed','KG','','','','Taiwan','',''],
  ['Mini Taiwan Pork Sausage','迷你台湾香肠','processed','KG','','','','Taiwan','',''],
  ['Chicken Hotdog','鸡肉香肠（热狗）','processed','KG','','','','','',''],
  ['Chicken Meat Ball','鸡肉丸','processed','KG','','','','','',''],
  ['Pork Meat Ball','猪肉丸','processed','KG','','','','','',''],
  ['Beef Meat Ball','牛肉丸','processed','KG','','','','','',''],
  ['Cheese Chicken Ball','芝士鸡肉丸','processed','KG','','','','','',''],
  ['Thailand Imitation Crab Sticks','泰国蟹条','processed','KG','','','','Thailand','',''],
  ['China Imitation Crab Sticks','中国蟹条','processed','KG','','','','China','',''],
  ['Crab Bites','蟹肉粒','processed','KG','','','','','',''],
  ['Seaweed Kelp Strip','海带丝','processed','KG','','','','','',''],
  ['Seaweed Kelp Slice','海带片','processed','KG','','','','','',''],
  ['Seaweed Kelp Knots','海带结','processed','KG','','','','','',''],
  ['Black Fungus','木耳（2kg/包）','processed','KG','2kg / Pkt','','','','',''],
  ['Japanese Chashu / Braised Pork Belly','日本叉烧','processed','KG','','','','Japan','',''],
  ['Ready-to-Eat Shredded Beef Tripe','即食牛白叶丝','processed','KG','','','','','',''],
  ['Ready-to-Eat Beef White Tripe Slices','即食牛白叶片','processed','KG','','','','','',''],
  ['Ready-to-Eat Beef Black Tripe Slices','即食牛黑叶片','processed','KG','','','','','',''],
];

// Convert array rows → objects (same shape as CSV parser output)
function rowToProduct(r) {
  return { nameEN:r[0], nameCN:r[1], category:r[2], uom:r[3], packSize:r[4],
           priceRange:r[5], moq:r[6], origin:r[7], imageUrl:r[8], notes:r[9] };
}

// ─────────────────────────────────────────────────
// CSV PARSER — handles quoted fields, commas inside quotes
// ─────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return null;
  const HEADERS = ['nameEN','nameCN','category','uom','packSize','priceRange','moq','origin','imageUrl','notes'];

  return lines.slice(1).map(line => {
    // Simple CSV parse: split on commas not inside quotes
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
    return obj;
  }).filter(p => p.nameEN);
}

// ─────────────────────────────────────────────────
// LOAD
// ─────────────────────────────────────────────────
async function loadProducts() {
  if (SHEETS_CSV_URL) {
    try {
      const res = await fetch(SHEETS_CSV_URL);
      const parsed = parseCSV(await res.text());
      if (parsed && parsed.length) return parsed;
    } catch(e) { console.warn('Sheets fetch failed, using fallback data.', e); }
  }
  return FALLBACK.map(rowToProduct);
}

// ─────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────
let ALL_PRODUCTS = [];
let ACTIVE_CAT   = 'all';
let SEARCH_TERM  = '';

// ─────────────────────────────────────────────────
// FILTER + SEARCH logic
// ─────────────────────────────────────────────────
function applyFilters(products) {
  let list = ACTIVE_CAT === 'all' ? products : products.filter(p => p.category === ACTIVE_CAT);
  if (SEARCH_TERM) {
    const q = SEARCH_TERM.toLowerCase();
    list = list.filter(p =>
      p.nameEN.toLowerCase().includes(q)   ||
      p.nameCN.includes(SEARCH_TERM)       ||
      p.origin.toLowerCase().includes(q)   ||
      p.priceRange.toLowerCase().includes(q) ||
      p.packSize.toLowerCase().includes(q) ||
      p.uom.toLowerCase().includes(q)      ||
      p.notes.toLowerCase().includes(q)
    );
  }
  return list;
}

// ─────────────────────────────────────────────────
// RENDER FILTER BAR
// ─────────────────────────────────────────────────
function renderFilterBar() {
  const bar = document.getElementById('filter-btns');
  if (!bar) return;
  bar.innerHTML = CATEGORIES.map(cat => `
    <button class="filter-btn ${ACTIVE_CAT === cat.id ? 'active' : ''}"
            onclick="filterProducts('${cat.id}')">
      ${cat.labelEN}
    </button>
  `).join('');
}

// ─────────────────────────────────────────────────
// RENDER PRODUCTS
// ─────────────────────────────────────────────────
/**
 * products_render.js — drop-in replacement for the render section of products.js
 *
 * Replaces the renderProducts() function only.
 * Paste this OVER the existing renderProducts() and getCategoryIcon() functions
 * in your js/products.js file.
 *
 * The new card design:
 * - No image placeholder (just a slim gold top bar)
 * - Chinese name prominent (same visual weight as EN name)
 * - All meta rows (UOM, Pack Size, MOQ, Price Range) same font size
 * - Origin badge if available
 * - "Enquire" button at bottom triggers modal
 */

// Replace the renderProducts() function in js/products.js with this version.
// Adds: image support (lh3 Google Drive URLs), placeholder fallback, click-through to product-detail.html

function renderProducts(products) {
  const grid  = document.getElementById('products-grid');
  const count = document.getElementById('products-count');
  if (!grid) return;

  const list = applyFilters(products);
  if (count) count.textContent = `${list.length} product${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    grid.innerHTML = `<div class="products__empty"><p>No products match your search.</p></div>`;
    return;
  }

  const lang = document.documentElement.getAttribute('data-lang') || 'en';

  grid.innerHTML = list.map((p, idx) => {
    const price   = p.priceRange || (lang === 'cn' ? '询价' : 'Contact for pricing');
    const moq     = p.moq        || (lang === 'cn' ? '联系我们' : 'Contact us');
    const nameEsc = p.nameEN.replace(/'/g, "\\'");
    const slug    = encodeURIComponent(p.nameEN);

    const imgHTML = p.imageUrl
      ? `<img class="product-card__image" src="${p.imageUrl}" alt="${p.nameEN}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const placeholderStyle = p.imageUrl ? 'display:none;' : '';

    return `
      <a href="product-detail.html?product=${slug}" class="product-card reveal" style="cursor:pointer;text-decoration:none;color:inherit;display:block;">
        <div class="product-card__image-wrap">
          ${imgHTML}
          <div class="product-card__placeholder" style="${placeholderStyle}">
            <span>${lang === 'cn' ? '图片即将上线' : 'Photo coming soon'}</span>
          </div>
          ${p.origin ? `<div class="product-card__tag">${p.origin}</div>` : ''}
        </div>
        <div class="product-card__body">
          <p class="product-card__origin">${p.nameCN}</p>
          <h3 class="product-card__name">${p.nameEN}</h3>
          <div class="detail-meta" style="margin-bottom:0.75rem;">
            <div class="detail-meta__item">
              <span class="detail-meta__label">${lang === 'cn' ? '单位' : 'UOM'}</span>
              <span class="detail-meta__value">${p.uom}</span>
            </div>
            ${p.packSize ? `<div class="detail-meta__item">
              <span class="detail-meta__label">${lang === 'cn' ? '包装' : 'Pack Size'}</span>
              <span class="detail-meta__value">${p.packSize}</span>
            </div>` : ''}
            <div class="detail-meta__item">
              <span class="detail-meta__label">${lang === 'cn' ? '最低订量' : 'MOQ'}</span>
              <span class="detail-meta__value">${moq}</span>
            </div>
            <div class="detail-meta__item">
              <span class="detail-meta__label">${lang === 'cn' ? '价格' : 'Price Range'}</span>
              <span class="detail-meta__value" style="font-size:0.85rem;font-weight:500;">${price}</span>
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%;font-size:0.68rem;padding:0.6rem;"
            onclick="event.stopPropagation();openEnquiry('${nameEsc}')">
            ${lang === 'cn' ? '询价' : 'Enquire'}
          </button>
        </div>
      </a>`;
  }).join('');

  setTimeout(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.05 });
    document.querySelectorAll('.product-card.reveal').forEach(el => obs.observe(el));
  }, 50);
}

// ─────────────────────────────────────────────────
// PUBLIC CONTROLS
// ─────────────────────────────────────────────────
function filterProducts(cat) {
  ACTIVE_CAT = cat;
  renderFilterBar();
  renderProducts(ALL_PRODUCTS);
}

function searchProducts(term) {
  SEARCH_TERM = term.trim();
  renderProducts(ALL_PRODUCTS);
  const count = document.getElementById('products-count');
  // update handled inside renderProducts
}

// ─────────────────────────────────────────────────
// ENQUIRY MODAL
// ─────────────────────────────────────────────────
function openEnquiry(productName) {
  const modal = document.getElementById('enquiry-modal');
  const field = document.getElementById('modal-product');
  if (!modal) return;
  if (field) field.value = productName || '';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeEnquiry() {
  const modal = document.getElementById('enquiry-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ─────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('products-grid')) return;

  // Pre-set category from URL ?category=pork etc
  const params = new URLSearchParams(window.location.search);
  if (params.get('category')) ACTIVE_CAT = params.get('category');

  ALL_PRODUCTS = await loadProducts();
  renderFilterBar();
  renderProducts(ALL_PRODUCTS);

  // Search input
  const searchInput = document.getElementById('product-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => searchProducts(e.target.value));
    searchInput.addEventListener('keydown', e => { if (e.key === 'Escape') { e.target.value = ''; searchProducts(''); } });
  }

  // Modal backdrop click
  document.getElementById('enquiry-modal')?.addEventListener('click', e => {
    if (e.target.id === 'enquiry-modal') closeEnquiry();
  });

  // Note: modal-form submission is handled exclusively by js/form_handler.js
  // (opens WhatsApp with pre-filled details). Do not add another submit
  // listener here — it will fire alongside form_handler.js's listener.
});