/* ── CONCIERGE STOREFRONT ──
   One module for the three pages that sell: the homepage, the shop and a
   product page. It was three copies of the same four hundred lines before
   there was more than one page to sell from, and a cart that lives on one
   page does not survive a link.

   What lives here: the Shopify calls, the weight conversion, the bag, and
   the quick add panel. What does not: how a card looks. Each page passes its
   own renderer, because the homepage card and the shop card say different
   things about the same product. */

const SHOPIFY_DOMAIN = 'concierge-coffee-2245.myshopify.com';
const STOREFRONT_TOKEN = '72c7d161eb6090308178da3ee5c88887';
const API_URL = `https://${SHOPIFY_DOMAIN}/api/2026-04/graphql.json`;

/* The bag has to survive the walk from the homepage to the shop and back.
   Shopify keeps the cart; this is only the ticket for it. */
const CART_KEY = 'cc_cart_id';

export async function shopifyFetch(query, variables = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) console.error('Shopify:', json.errors);
  return json.data;
}

const PRODUCT_FIELDS = `
  id title handle description tags
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 6) { edges { node { url altText } } }
  variants(first: 10) { edges { node { id title price { amount } availableForSale selectedOptions { name value } } } }
`;

const CART_FIELDS = `
  id checkoutUrl
  cost { totalAmount { amount currencyCode } }
  lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant {
    id title price { amount } image { url } product { title handle } } } } } }
`;

let products = [];
let cart = null;

export function allProducts() { return products; }

/* Drinks are orderable from the menu grid, not the shop grid. The tag is the
   switch: anything tagged `drink` in Shopify stays out of every bean grid
   but can still be opened, bought and bagged like the rest. */
export function isDrink(p) { return (p.tags || []).includes('drink'); }
export function productByHandle(handle) { return products.find(p => p.handle === handle) || null; }

/* Grid order. Lower comes first; anything not listed lands in the middle.
   Decaf sits last because it is decaf. */
const HANDLE_ORDER = {
  'espresso-blend-250g': 10,
  'filter-single-origin-250g': 20,
  'seasonal-limited': 30,
  'espresso-roast': 40,
  'decaf-roast': 100,
};

export async function loadProducts() {
  const data = await shopifyFetch(`{ products(first: 20) { edges { node { ${PRODUCT_FIELDS} } } } }`);
  products = data?.products?.edges?.map(e => e.node) ?? [];
  products.sort((a, b) => (HANDLE_ORDER[a.handle] ?? 50) - (HANDLE_ORDER[b.handle] ?? 50));
  return products;
}

/* ── TEXT ──
   Product titles and copy come from Shopify and land inside attributes and
   markup, so escape before interpolating. */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function formatPrice(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

/* Shopify carries the variants in grams and kilos. The shop is in Los Angeles,
   so every weight the site shows is converted. Under a pound reads in ounces. */
export function usWeight(label) {
  return String(label ?? '').replace(
    /(\d+(?:[.,]\d+)?)\s*(kg|kilogramme?s?|kilograms?|g|gramme?s?|grams?)\b/gi,
    (_, n, unit) => {
      const grams = parseFloat(n.replace(',', '.')) * (/^k/i.test(unit) ? 1000 : 1);
      const oz = grams / 28.349523125;
      return oz >= 16 ? `${(oz / 16).toFixed(1)} lb` : `${oz.toFixed(1)} oz`;
    }
  );
}

/* Most products in the shop carry the pack weight in the title, e.g.
   "Espresso Blend 300g". Split it off so the name reads as a name and the
   weight goes through the same conversion as everything else. */
export const TITLE_WEIGHT = /\s+(\d+(?:[.,]\d+)?\s*(?:kg|kilogramme?s?|kilograms?|g|gramme?s?|grams?))\s*$/i;

export function productName(p) {
  return p.title.replace(TITLE_WEIGHT, '').trim() || p.title;
}

/* Same treatment for a title we only have as a string, e.g. a bag line. */
export function titleToUS(title) {
  const s = String(title ?? '');
  const m = s.match(TITLE_WEIGHT);
  return m ? `${s.replace(TITLE_WEIGHT, '').trim()} ${usWeight(m[1])}` : usWeight(s);
}

export function variantSize(v) {
  return usWeight(v.selectedOptions?.find(o => o.name === 'Size')?.value ?? v.title);
}

export function variantSizes(p) {
  return p.variants.edges
    .map(e => e.node.selectedOptions?.find(o => o.name === 'Size')?.value ?? e.node.title)
    .filter(s => s && s !== 'Default Title')
    .map(usWeight);
}

/* Weight to show on a card. Variant sizes win when the product has real
   ones; otherwise fall back to the weight named in the title. */
export function productSizes(p) {
  const fromVariants = variantSizes(p);
  if (fromVariants.length) return fromVariants;
  const m = p.title.match(TITLE_WEIGHT);
  return m ? [usWeight(m[1])] : [];
}

export function variants(p) { return p.variants.edges.map(e => e.node); }
export function inStock(p) { return variants(p).some(v => v.availableForSale); }

/* ── PICTURES ──
   Shopify has a packshot for two of the five. The rest fall back to a frame
   in the repo, keyed on handle so a photograph uploaded to Shopify silently
   takes over. */
const FALLBACK_IMAGES = {
  'espresso-roast': 'images/product-blank.jpg',
  'espresso-blend-250g': 'images/product-espresso.jpg',
  'filter-single-origin-250g': 'images/product-colombia.jpg',
  'decaf-roast': 'images/product-blank-overhead.jpg',
  'seasonal-limited': 'images/product-peru.jpg',
  /* Saffron Latte has no photograph in Shopify yet; the crop from the Local
     Lens feature carries the card until one is uploaded. */
  'saffron-latte': 'images/drink-saffron-latte.jpg',
};

/* The hover frame on a drink card: a second photograph of the same drink.
   A product's second Shopify image wins when one exists; this map fills in
   from the repo until then. A drink with no second frame simply keeps its
   photograph on hover. */
const DRINK_ALT = {
  'einspanner': 'images/drink-einspanner-02.jpg',
  'flat-white': 'images/drink-flat-white.jpg',
  'latte-iced': 'images/drink-iced-latte.jpg',
  'filter-iced': 'images/drink-iced-filter-02.jpg',
  'matcha-latte-iced': 'images/drink-iced-matcha-latte.jpg',
  'yuzu-matcha-tonic': 'images/drink-yuzu-matcha-tonic-02.jpg',
  'affogato': 'images/drink-matcha-affogato-02.jpg',
  'matcha-affogato': 'images/drink-matcha-affogato.jpg',
  'cardamom-rose-cream-top': 'images/drink-cardamom-rose.jpg',
};
export function getDrinkAltImage(p) {
  return p.images.edges[1]?.node?.url || DRINK_ALT[p.handle] || null;
}

export function getProductImage(p) {
  return p.images.edges[0]?.node?.url || FALLBACK_IMAGES[p.handle] || 'images/espresso.jpeg';
}

/* Hover layer: the roasted bean, darker for the espresso roasts and lighter
   for the filters, so the swap says something about the coffee. */
const BEANS = {
  'espresso-blend-250g': 'images/beans-dark.jpg',
  'espresso-roast': 'images/beans-dark.jpg',
  'filter-single-origin-250g': 'images/beans-medium.jpg',
  'decaf-roast': 'images/beans-medium.jpg',
  'seasonal-limited': 'images/beans-medium.jpg',
};

export function getBeanImage(p) { return BEANS[p.handle] || 'images/beans-dark.jpg'; }

export function productHref(p) { return `product.html?p=${encodeURIComponent(p.handle)}`; }

/* ── PROPOSALS ──
   Blends put to Benjamin and Namy rather than products. Named from the hotel
   world the crossed keys already point at, which extends: valet, porter,
   doorman, maître d'. No "blend" in any name, per the naming note. */
export const CONCEPTS = [];  // Doorman, Valet, Night Porter removed Aug 2026

/* ── MERCH ──
   None of it is in Shopify, so none of it can be bought here yet. The cards
   say so rather than carrying a price that does not exist. */
export const MERCH = [
  { name: 'Porsche 911 Carrera RSR', sub: 'TAMIYA · Concierge Limited Special Edition · Handmade',
    img: 'images/merch-rc-car-1.jpg', fit: 'contain', bg: '#fff' },
  { name: 'Water Bottle', sub: 'Limited Edition · KINTO', img: 'images/merch-waterbottle.webp' },
  { name: 'T-Shirt',      sub: 'Limited Edition',         img: 'images/merch-tshirt.jpg' },
  { name: 'Sweater',      sub: 'Limited Edition · Reverse Weave', img: 'images/merch-sweater.jpg' },
];

/* ── SHOP CARD ──
   The card the shop page and the product page both use: picture, name, the
   line Shopify carries if there is one, price and size, and the button that
   opens the quick add panel. Written here rather than on each page so the two
   cannot drift; the homepage keeps its own card, which says the same things
   over the photograph instead of under it. */
export function shopCardHTML(p) {
  const vs = variants(p);
  const price = formatPrice(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode);
  const lead = vs.length > 1 ? `From ${price}` : price;
  const sizes = productSizes(p).join(' / ');
  const sellable = inStock(p);
  const desc = String(p.description || '').trim();
  return `
    <div class="card sp-card">
      <a class="sp-hit" href="${productHref(p)}">
        <div class="card-img">
          <img class="card-base" src="${esc(getProductImage(p))}" alt="${esc(p.title)}" loading="lazy" />
        </div>
        <div class="sp-name">${esc(productName(p))}</div>
        ${desc ? `<p class="sp-sub">${esc(usWeight(desc))}</p>` : ''}
      </a>
      <div class="sp-foot"><span class="sp-lead">${lead}</span><span>${esc(sizes)}</span></div>
      <button class="sp-add"${sellable ? '' : ' disabled'} onclick="openProduct('${p.id}')">${
        sellable ? 'Add to Cart' : 'Sold out'}</button>
    </div>`;
}

/* ── CHROME ──
   The bag and the quick add panel are injected rather than written into each
   page, so the shop and the homepage cannot drift apart. Both are inert until
   something opens them. */
const CHROME = `
<div class="pdp-overlay" id="pdp-overlay" role="dialog" aria-modal="true" aria-labelledby="pdp-name">
  <div class="qa-modal" id="qa-modal">
    <button class="qa-x" onclick="closePdp()" aria-label="Close">&times;</button>
    <div class="qa-img"><img id="pdp-hero-img" src="" alt="" /></div>
    <div class="qa-panel">
      <div class="qa-top">
        <button class="qa-back" onclick="closePdp()">&larr; Back</button>
        <!-- rewritten to the product page every time the panel opens; the
             shop is the fallback, because a bare hash jumps to the top -->
        <a class="qa-details" id="pdp-details" href="shop.html">See Full Details</a>
      </div>
      <div class="qa-name" id="pdp-name"></div>
      <div class="qa-price" id="pdp-price"></div>
      <div class="qa-field">
        <label class="qa-lbl" for="pdp-size">Select size</label>
        <select class="qa-sel" id="pdp-size" onchange="selectVariant(this.value)"></select>
      </div>
      <div class="qa-field">
        <label class="qa-lbl" for="pdp-qty">Quantity</label>
        <select class="qa-sel" id="pdp-qty">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}">${n}</option>`).join('')}
        </select>
      </div>
      <button class="atc" id="pdp-atc" onclick="pdpAddToCart()">Add to Cart</button>
    </div>
  </div>
</div>

<div class="cart-overlay" id="cart-overlay" onclick="closeCart()"></div>
<div class="cart-drawer" id="cart-drawer">
  <div class="cart-drawer-head">
    <span class="cart-drawer-title">Bag</span>
    <button class="cart-close" onclick="closeCart()" aria-label="Close">&times;</button>
  </div>
  <div class="cart-items" id="cart-items">
    <div class="cart-empty">Your bag is empty.</div>
  </div>
  <div class="cart-footer">
    <div class="cart-total">
      <span class="cart-total-lbl">Total</span>
      <span id="cart-total">$0.00</span>
    </div>
    <button class="atc" id="checkout-btn" onclick="goToCheckout()" disabled>Checkout</button>
  </div>
</div>`;

function mountChrome() {
  if (document.getElementById('pdp-overlay')) return;
  const holder = document.createElement('div');
  holder.innerHTML = CHROME;
  while (holder.firstChild) document.body.appendChild(holder.firstChild);
  // Clicking the backdrop closes; clicking the panel must not.
  document.getElementById('pdp-overlay').addEventListener('click', e => {
    if (e.target.id === 'pdp-overlay') closePdp();
  });
}

/* ── BAG ── */
export async function addToCartHandler(variantId, quantity = 1) {
  if (!variantId) return;
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  updateBagLink('...');

  if (!cart) {
    const data = await shopifyFetch(`
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) { cart { ${CART_FIELDS} } }
      }`, { input: { lines: [{ merchandiseId: variantId, quantity: qty }] } });
    cart = data?.cartCreate?.cart;
  } else {
    const data = await shopifyFetch(`
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } }
      }`, { cartId: cart.id, lines: [{ merchandiseId: variantId, quantity: qty }] });
    cart = data?.cartLinesAdd?.cart;
  }

  rememberCart();
  renderCart();
  openCart();
}

function rememberCart() {
  try {
    if (cart?.id) localStorage.setItem(CART_KEY, cart.id);
    else localStorage.removeItem(CART_KEY);
  } catch (e) { /* private mode: the bag is then per page, as before */ }
}

/* A bag left open on the homepage is the same bag on the shop page. The id
   can outlive its cart -- checked out, or expired -- so a miss clears it
   rather than leaving a dead ticket behind. */
async function restoreCart() {
  let id = null;
  try { id = localStorage.getItem(CART_KEY); } catch (e) { return; }
  if (!id) return;
  const data = await shopifyFetch(`query cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`, { id });
  cart = data?.cart ?? null;
  if (!cart) { try { localStorage.removeItem(CART_KEY); } catch (e) {} return; }
  renderCart();
}

export function renderCart() {
  if (!cart) return;
  const lines = cart.lines.edges.map(e => e.node);
  const total = cart.cost.totalAmount;
  updateBagLink(lines.reduce((s, l) => s + l.quantity, 0));

  const itemsEl = document.getElementById('cart-items');
  if (!lines.length) {
    itemsEl.innerHTML = '<div class="cart-empty">Your bag is empty.</div>';
  } else {
    itemsEl.innerHTML = lines.map(line => {
      const m = line.merchandise;
      const img = m.image?.url;
      return `
        <div class="ci">
          <div class="ci-img">${img ? `<img src="${esc(img)}" alt="${esc(m.product.title)}">` : ''}</div>
          <div>
            <div class="ci-name">${esc(titleToUS(m.product.title))}</div>
            <div class="ci-sub">${m.title !== 'Default Title' ? esc(usWeight(m.title)) : ''} &times; ${line.quantity}</div>
          </div>
          <div class="ci-price">${formatPrice(m.price.amount * line.quantity)}</div>
        </div>`;
    }).join('');
  }

  document.getElementById('cart-total').textContent = formatPrice(total.amount, total.currencyCode);
  document.getElementById('checkout-btn').disabled = !lines.length;
}

export function updateBagLink(count) {
  const el = document.getElementById('bag-link');
  if (el) el.textContent = `Bag (${count})`;
}

/* The Shop column of the footer is the catalogue, on every page that has a
   footer, which is every page. Written here rather than in each page's module
   because the footer is now the same everywhere and should stay that way. */
/* The footer sells in three words, not a product list; the links are static
   in the markup. The hook stays so a page without them still gets a set. */
function renderFooterLinks() {
  const ul = document.getElementById('footer-links');
  if (!ul || ul.children.length > 1) return;
  ul.innerHTML = `
    <li><a href="shop.html">Coffee</a></li>
    <li><a href="index.html#menu">Drinks</a></li>
    <li><a href="shop.html#merch">Merch</a></li>`;
}

export function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
}

export function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
}

export function goToCheckout() {
  if (cart?.checkoutUrl) window.location.href = cart.checkoutUrl;
}

/* ── QUICK ADD ──
   A picture, a size, a count, one dark button. Everything else about the
   coffee is a click away under See Full Details, which is a page rather than
   a second overlay. */
let currentProduct = null;
let selectedVariant = null;

/* Where the order came from. The panel opens over the card that was clicked
   rather than the middle of the page, above it when there is room, below it
   when there is not, always inside the viewport. On a phone it stays the
   centred sheet. */
let originRect = null;
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', e => {
    const card = e.target.closest ? e.target.closest('.card') : null;
    originRect = card ? card.getBoundingClientRect() : null;
  }, true);
}

function placeQaModal() {
  const modal = document.getElementById('qa-modal');
  if (!modal) return;
  modal.style.position = '';
  modal.style.left = '';
  modal.style.top = '';
  modal.style.margin = '';
  if (!originRect || window.innerWidth <= 768) return;
  const m = modal.getBoundingClientRect();
  let left = originRect.left + originRect.width / 2 - m.width / 2;
  left = Math.max(16, Math.min(left, window.innerWidth - m.width - 16));
  let top = originRect.top - m.height - 12;
  if (top < 16) top = originRect.bottom + 12;
  top = Math.max(16, Math.min(top, window.innerHeight - m.height - 16));
  modal.style.position = 'fixed';
  modal.style.left = `${Math.round(left)}px`;
  modal.style.top = `${Math.round(top)}px`;
  modal.style.margin = '0';
}

export function openProduct(key) {
  const p = products.find(x => x.id === key || x.handle === key);
  if (!p) return;
  currentProduct = p;

  const vs = variants(p);
  selectedVariant = vs.find(v => v.availableForSale) || vs[0] || null;

  const img = document.getElementById('pdp-hero-img');
  img.src = getProductImage(p);
  img.alt = p.title;

  document.getElementById('pdp-name').textContent = productName(p);
  document.getElementById('pdp-details').href = productHref(p);

  const sel = document.getElementById('pdp-size');
  sel.innerHTML = vs.map(v => {
    const size = variantSize(v);
    return `<option value="${esc(v.id)}"${v.id === selectedVariant?.id ? ' selected' : ''}${v.availableForSale ? '' : ' disabled'}>${
      esc(size === 'Default Title' ? 'One size' : size)}${v.availableForSale ? '' : ' · Sold out'}</option>`;
  }).join('');
  // One size is not a choice. The row stays so the panel keeps its shape.
  sel.disabled = vs.length < 2;

  const qty = document.getElementById('pdp-qty');
  qty.value = '1';

  updatePdpPrice();
  document.getElementById('pdp-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  placeQaModal();
}

export function closePdp(e) {
  if (e && e.target && e.target.id !== 'pdp-overlay') return;
  document.getElementById('pdp-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

export function selectVariant(variantId) {
  if (!currentProduct) return;
  selectedVariant = variants(currentProduct).find(v => v.id === variantId) || selectedVariant;
  const sel = document.getElementById('pdp-size');
  if (sel && sel.value !== selectedVariant.id) sel.value = selectedVariant.id;
  updatePdpPrice();
}

function updatePdpPrice() {
  const priceEl = document.getElementById('pdp-price');
  const btn = document.getElementById('pdp-atc');
  if (!selectedVariant) { priceEl.textContent = ''; return; }
  priceEl.textContent = formatPrice(selectedVariant.price.amount);
  const sellable = selectedVariant.availableForSale;
  btn.disabled = !sellable;
  btn.textContent = sellable ? 'Add to Cart' : 'Sold out';
}

export async function pdpAddToCart() {
  if (!selectedVariant || !selectedVariant.availableForSale) return;
  const btn = document.getElementById('pdp-atc');
  const qty = document.getElementById('pdp-qty')?.value || 1;
  btn.disabled = true;
  btn.textContent = 'Adding...';
  await addToCartHandler(selectedVariant.id, qty);
  btn.disabled = false;
  btn.textContent = 'Add to Cart';
  closePdp();
}

/* ── INIT ──
   The page passes what it wants drawn. Everything else is the same on every
   page that sells. */
export async function initStore({ render } = {}) {
  mountChrome();

  Object.assign(window, {
    openProduct, closePdp, selectVariant, pdpAddToCart,
    addToCartHandler, openCart, closeCart, goToCheckout,
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closePdp();
    closeCart();
  });

  await loadProducts();
  render?.(products.filter(p => !isDrink(p)));
  renderFooterLinks();
  await restoreCart();
  return products;
}
