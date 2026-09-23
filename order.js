/* ── PICK-UP ORDERING ──
   The drinks section of the homepage when PICKUP_ORDERING is on: the menu
   comes from /api/menu (the curated list in functions/_lib/menu.js with
   Square's live prices), the customer builds a small pick-up bag, and
   "Pay with Square" posts it to /api/order, which answers with a hosted
   Square checkout to send them to. The bag lives in sessionStorage so a
   reload does not lose it. Nothing here talks to Square directly.

   The page decides what a card looks like; this module owns the panel,
   the bag and the calls, the way shopify.js does for coffee. It reuses
   the quick add panel's and the bag drawer's classes so the two sales
   look the same. */

import { esc, formatPrice, barOpen, barOpensAt, pickupSlots } from './shopify.js';

const KEY = 'cc_pickup';
let menu = null;
let bag = [];

const money = cents => formatPrice(cents / 100);

/* ── MENU ── */
export async function loadMenu() {
  const res = await fetch('api/menu', { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('menu ' + res.status);
  const data = await res.json();
  if (!data?.ok || !Array.isArray(data.items) || !data.items.length) throw new Error('menu empty');
  menu = data;
  return menu;
}

const itemByKey = key => menu?.items.find(i => i.key === key) || null;
const fromPrice = item => Math.min(...item.sizes.map(s => s.price));

/* A card for a drink with a photograph; the page's drink-card language. */
function photoCardHTML(item) {
  const closed = !barOpen();
  const price = money(fromPrice(item));
  /* The price sits on the card's foot already; the button says only what it
     does (Frederik, 23 Sep). */
  const cta = closed ? `Closed · ${barOpensAt()}` : 'Order for pick-up';
  const tight = closed ? `Closed · ${barOpensAt()}` : 'Order';
  const sizes = item.sizes.map(s => s.label).filter(l => l !== 'Regular').join(' / ');
  const src = item.photo, small = item.photo.replace(/\.webp$/, '-800.webp');
  return `
    <div class="card drink-card">
      <a class="card-hit" href="#menu" aria-label="${esc(item.name)}" data-drink="${esc(item.key)}"></a>
      <div class="card-img">
        <img class="card-base" src="${esc(src)}" srcset="${esc(small)} 800w, ${esc(src)} 1200w" sizes="50vw" alt="${esc(item.name)}" loading="lazy" decoding="async" />
        <div class="card-face">
          <div>
            <div class="card-blend">${esc(item.name)}</div>
            <div class="drink-ing">${esc(item.ingredients || '')}</div>
          </div>
          <div>
            <div class="card-meta"><span>${esc(sizes)}</span><span>${price}</span></div>
            <button class="card-cta"${closed ? ' disabled' : ''} aria-label="${closed ? esc(cta) : `Order ${esc(item.name)} for pick-up`}" data-drink="${esc(item.key)}"><span class="cta-full" aria-hidden="true">${esc(cta)}</span><span class="cta-tight" aria-hidden="true">${esc(tight)}</span></button>
          </div>
        </div>
      </div>
    </div>`;
}

/* A line in the list for everything else. */
function rowHTML(item) {
  const closed = !barOpen();
  const sizes = item.sizes.map(s => s.label).filter(l => l !== 'Regular').join(' / ');
  const prices = item.sizes.map(s => money(s.price)).join(' / ');
  return `
    <div class="menu-row" role="listitem">
      <div>
        <div class="menu-row-name">${esc(item.name)}</div>
        ${item.ingredients ? `<div class="menu-row-ing">${esc(item.ingredients)}</div>` : ''}
      </div>
      <div class="menu-row-right">
        <div class="menu-row-price">${sizes ? `<span>${esc(sizes)}</span>` : ''}<span>${prices}</span></div>
        <button class="menu-row-add" type="button"${closed ? ' disabled' : ''} data-drink="${esc(item.key)}" aria-label="Order ${esc(item.name)} for pick-up">${closed ? 'Closed' : 'Order'}</button>
      </div>
    </div>`;
}

function tileHTML(item) {
  const closed = !barOpen();
  const sizes = item.sizes.map(s => s.label).filter(l => l !== 'Regular').join(' / ');
  const prices = item.sizes.map(s => money(s.price)).join(' / ');
  return `
    <div class="menu-tile" role="listitem">
      <div class="menu-row-name">${esc(item.name)}</div>
      <div class="menu-row-ing">${esc(item.ingredients || '')}</div>
      <div class="menu-tile-foot">
        <div class="menu-row-price">${sizes ? `<span>${esc(sizes)}</span>` : ''}<span>${prices}</span></div>
        <button class="menu-row-add" type="button"${closed ? ' disabled' : ''} data-drink="${esc(item.key)}" aria-label="Order ${esc(item.name)} for pick-up">${closed ? 'Closed' : 'Order'}</button>
      </div>
    </div>`;
}

export function renderPickupMenu() {
  const lead = document.getElementById('menu-lead');
  const grid = document.getElementById('menu-grid');
  const line = document.getElementById('menu-pickup');
  lead.classList.add('menu-lead--photos');
  grid.classList.add('menu-grid--list');
  grid.setAttribute('role', 'list');

  const photos = menu.items.filter(i => i.photo);
  lead.innerHTML = photos.map(photoCardHTML).join('');
  /* The list carries what the photographs do not; a pictured drink is
     ordered from its card. A short list runs flat, section heads only
     earn their place once there are enough rows to need finding. */
  const rows = menu.items.filter(i => !i.photo);
  if (rows.length > 8) {
    grid.innerHTML = menu.sections.map(sec => {
      const items = rows.filter(i => i.section === sec);
      return items.length ? `<div class="menu-sec"><h3 class="menu-sec-h">${esc(sec)}</h3>${items.map(rowHTML).join('')}</div>` : '';
    }).join('');
  } else {
    /* Three tiles across, each a name, its ingredients, then size, price
       and the button along the foot; a row of six drinks at full width had
       the name at one edge and the price at the other. */
    grid.classList.add('menu-grid--tiles');
    grid.innerHTML = rows.map(tileHTML).join('');
  }

  line.innerHTML = barOpen()
    ? `Order here, pay with Square, pick up at the bar. 821 Traction Ave, Arts District, Downtown LA. <button type="button" class="menu-bag-link" id="menu-bag-link" hidden></button>`
    : `Pick-up ordering opens with the bar at ${esc(barOpensAt().replace('Opens ', ''))}. 821 Traction Ave, Arts District, Downtown LA.`;
  document.getElementById('menu').hidden = false;

  document.getElementById('menu').addEventListener('click', e => {
    const t = e.target.closest('[data-drink]');
    if (t) { e.preventDefault(); openDrink(t.dataset.drink); return; }
    if (e.target.closest('#menu-bag-link')) openBag();
  });
  restoreBag();
  mountChrome();
  renderBag();
  thanks();
}

/* ── THE PANEL ── one drink, its size, its options, a count. */
let current = null;

function mountChrome() {
  if (document.getElementById('po-overlay')) return;
  const holder = document.createElement('div');
  holder.innerHTML = `
<div class="pdp-overlay" id="po-overlay" role="dialog" aria-modal="true" aria-labelledby="po-name">
  <div class="qa-modal" id="po-modal" tabindex="-1">
    <button class="qa-x" type="button" id="po-x" aria-label="Close">&times;</button>
    <form class="qa-panel" id="po-form" novalidate>
      <div class="qa-name" id="po-name"></div>
      <div class="qa-price" id="po-price"></div>
      <div id="po-fields"></div>
      <div class="qa-field">
        <label class="qa-lbl" for="po-qty">Quantity</label>
        <select class="qa-sel" id="po-qty" name="quantity">${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}">${n}</option>`).join('')}</select>
      </div>
      <button class="atc" type="submit" id="po-add">Add to pick-up order</button>
    </form>
  </div>
</div>
<div class="cart-overlay" id="pb-overlay"></div>
<div class="cart-drawer" id="pb-drawer" role="dialog" aria-modal="true" aria-label="Pick-up order" tabindex="-1">
  <div class="cart-drawer-head">
    <span class="cart-drawer-title">Pick-up order</span>
    <button class="cart-close" type="button" id="pb-x" aria-label="Close">&times;</button>
  </div>
  <div class="cart-items" id="pb-items"></div>
  <form class="pb-form" id="pb-form" novalidate>
    <div class="qa-field">
      <label class="qa-lbl" for="pb-when">Pick-up time</label>
      <select class="qa-sel" id="pb-when" name="when"></select>
    </div>
    <div class="qa-field">
      <label class="qa-lbl" for="pb-name">Name for the order</label>
      <input class="ws-in" id="pb-name" name="name" type="text" required autocomplete="name" />
    </div>
    <div class="qa-field">
      <label class="qa-lbl" for="pb-phone">Phone</label>
      <input class="ws-in" id="pb-phone" name="phone" type="tel" required autocomplete="tel" />
    </div>
    <div class="qa-field">
      <label class="qa-lbl" for="pb-note">Anything for the bar</label>
      <input class="ws-in" id="pb-note" name="note" type="text" placeholder="Extra hot, no lid, meeting someone" />
    </div>
    <p class="pb-error" id="pb-error" hidden></p>
    <div class="cart-footer">
      <div class="cart-total"><span class="cart-total-lbl">Drinks</span><span id="pb-total">$0.00</span></div>
      <p class="pb-note">Tax and tip on Square's page. Pay there, collect at the bar.</p>
      <button class="atc" type="submit" id="pb-pay" disabled>Pay with Square</button>
    </div>
  </form>
</div>`;
  while (holder.firstChild) document.body.appendChild(holder.firstChild);

  document.getElementById('po-x').addEventListener('click', closeDrink);
  document.getElementById('po-overlay').addEventListener('click', e => { if (e.target.id === 'po-overlay') closeDrink(); });
  document.getElementById('po-form').addEventListener('submit', e => { e.preventDefault(); addCurrent(); });
  document.getElementById('po-fields').addEventListener('change', updatePanelPrice);
  document.getElementById('po-qty').addEventListener('change', updatePanelPrice);
  document.getElementById('pb-x').addEventListener('click', closeBag);
  document.getElementById('pb-overlay').addEventListener('click', closeBag);
  document.getElementById('pb-items').addEventListener('click', e => {
    const b = e.target.closest('[data-remove]');
    if (b) { bag.splice(Number(b.dataset.remove), 1); saveBag(); renderBag(); }
  });
  document.getElementById('pb-form').addEventListener('submit', e => { e.preventDefault(); pay(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrink(); closeBag(); } });
}

function fieldsHTML(item) {
  const parts = [];
  if (item.sizes.length > 1) {
    parts.push(`<div class="qa-field"><label class="qa-lbl" for="po-size">Size</label>
      <select class="qa-sel" id="po-size" name="size">${item.sizes.map((s, i) =>
        `<option value="${esc(s.id)}"${i === 0 ? ' selected' : ''}>${esc(s.label)} · ${money(s.price)}</option>`).join('')}</select></div>`);
  }
  for (const listId of item.lists) {
    const list = menu.lists[listId];
    if (!list || !list.options.length) continue;
    const name = `list-${listId}`;
    if (list.mode === 'one') {
      const none = list.none ? `<option value="">${esc(list.none)}</option>` : '';
      parts.push(`<div class="qa-field"><label class="qa-lbl" for="${name}">${esc(list.name)}</label>
        <select class="qa-sel" id="${name}" name="${name}">${none}${list.options.map((o, i) =>
          `<option value="${esc(listId + ':' + o.id)}"${!none && i === 0 ? ' selected' : ''}>${esc(o.name)}${o.price ? ` · +${money(o.price)}` : ''}</option>`).join('')}</select></div>`);
    } else {
      parts.push(`<fieldset class="qa-field po-many"><legend class="qa-lbl">${esc(list.name)}</legend>${list.options.map(o =>
        `<label class="po-opt"><input type="checkbox" name="${name}" value="${esc(listId + ':' + o.id)}" /> <span>${esc(o.name)}</span><span class="po-opt-price">${o.price ? `+${money(o.price)}` : ''}</span></label>`).join('')}</fieldset>`);
    }
  }
  return parts.join('');
}

function readPanel() {
  const form = document.getElementById('po-form');
  const fd = new FormData(form);
  const sizeId = fd.get('size') || current.sizes[0].id;
  const size = current.sizes.find(s => s.id === sizeId) || current.sizes[0];
  const chosen = [];
  for (const [k, v] of fd.entries()) if (k.startsWith('list-') && v) chosen.push(String(v));
  const qty = Math.max(1, Math.min(10, parseInt(fd.get('quantity'), 10) || 1));
  return { size, chosen, qty };
}

function modifierPrice(tagged) {
  const [listId, id] = tagged.split(':');
  return menu.lists[listId]?.options.find(o => o.id === id)?.price || 0;
}
function modifierName(tagged) {
  const [listId, id] = tagged.split(':');
  return menu.lists[listId]?.options.find(o => o.id === id)?.name || '';
}
const lineUnit = l => l.price + l.modifierIds.reduce((s, m) => s + modifierPrice(m), 0);

function updatePanelPrice() {
  if (!current) return;
  const { size, chosen, qty } = readPanel();
  const unit = size.price + chosen.reduce((s, m) => s + modifierPrice(m), 0);
  document.getElementById('po-price').textContent = qty > 1 ? `${money(unit)} each · ${money(unit * qty)}` : money(unit);
}

let opener = null;
export function openDrink(key) {
  const item = itemByKey(key);
  if (!item || !barOpen()) return;
  current = item;
  document.getElementById('po-name').textContent = item.name;
  document.getElementById('po-fields').innerHTML = fieldsHTML(item);
  document.getElementById('po-qty').value = '1';
  updatePanelPrice();
  opener = document.activeElement;
  document.getElementById('po-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('po-modal').focus();
}

function closeDrink() {
  const ov = document.getElementById('po-overlay');
  if (!ov?.classList.contains('open')) return;
  ov.classList.remove('open');
  document.body.style.overflow = '';
  current = null;
  opener?.focus?.(); opener = null;
}

function addCurrent() {
  if (!current) return;
  const { size, chosen, qty } = readPanel();
  bag.push({ key: current.key, name: current.name, sizeLabel: size.label, variationId: size.id, price: size.price,
    modifierIds: chosen, quantity: qty });
  saveBag();
  const back = opener; opener = null;
  closeDrink();
  renderBag();
  openBag(back);
}

/* ── THE BAG ── */
function saveBag() { try { sessionStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) { /* private mode */ } }
function restoreBag() {
  try { bag = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { bag = []; }
  if (!Array.isArray(bag)) bag = [];
  /* Lines whose drink or size left the menu since drop out silently. */
  bag = bag.filter(l => menu.items.some(i => i.key === l.key && i.sizes.some(s => s.id === l.variationId)));
}

let bagOpener = null;
function openBag(from) {
  document.getElementById('pb-overlay').classList.add('open');
  const d = document.getElementById('pb-drawer');
  const was = d.classList.contains('open');
  d.classList.add('open');
  if (!was) { bagOpener = from || document.activeElement; d.focus(); }
  fillSlots();
}
function closeBag() {
  document.getElementById('pb-overlay')?.classList.remove('open');
  document.getElementById('pb-drawer')?.classList.remove('open');
  bagOpener?.focus?.(); bagOpener = null;
}

function fillSlots() {
  const sel = document.getElementById('pb-when');
  const keep = sel.value;
  const slots = pickupSlots();
  sel.innerHTML = slots.map((s, i) => `<option value="${i === 0 ? 'asap' : esc(slotToISO(s))}">${esc(s)}</option>`).join('');
  if (keep && [...sel.options].some(o => o.value === keep)) sel.value = keep;
}

/* "2:30pm" on the bar's clock, as an ISO instant. Today in Los Angeles. */
function slotToISO(label) {
  const m = label.match(/^(\d+):(\d\d)(am|pm)$/);
  if (!m) return 'asap';
  let h = parseInt(m[1], 10) % 12; if (m[3] === 'pm') h += 12;
  const now = new Date();
  const la = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = t => la.find(p => p.type === t).value;
  /* Build the instant by asking what UTC offset Los Angeles has right now. */
  const guess = new Date(`${get('year')}-${get('month')}-${get('day')}T${String(h).padStart(2, '0')}:${m[2]}:00Z`);
  const laHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hour12: false }).format(guess), 10) % 24;
  const offset = ((laHour - h + 36) % 24) - 12; // hours LA is behind UTC at that instant, negative west
  return new Date(guess.getTime() - offset * 3600e3).toISOString();
}

function renderBag() {
  const items = document.getElementById('pb-items');
  const total = bag.reduce((s, l) => s + lineUnit(l) * l.quantity, 0);
  items.innerHTML = bag.length ? bag.map((l, i) => `
    <div class="ci ci--pickup">
      <div>
        <div class="ci-name">${esc(l.name)}${l.sizeLabel !== 'Regular' ? ` · ${esc(l.sizeLabel)}` : ''}</div>
        <div class="ci-sub">${esc(l.modifierIds.map(modifierName).filter(Boolean).join(', ') || 'As it comes')} &times; ${l.quantity}</div>
        <button class="ci-remove" type="button" data-remove="${i}" aria-label="Remove ${esc(l.name)}">Remove</button>
      </div>
      <div class="ci-price">${money(lineUnit(l) * l.quantity)}</div>
    </div>`).join('') : '<div class="cart-empty">Nothing yet. Pick a drink from the menu.</div>';
  document.getElementById('pb-total').textContent = money(total);
  document.getElementById('pb-pay').disabled = !bag.length || !barOpen();
  const link = document.getElementById('menu-bag-link');
  if (link) {
    const n = bag.reduce((s, l) => s + l.quantity, 0);
    link.hidden = !n;
    link.textContent = `Your order: ${n} drink${n === 1 ? '' : 's'}, ${money(total)} →`;
  }
}

async function pay() {
  const form = document.getElementById('pb-form');
  const err = document.getElementById('pb-error');
  const btn = document.getElementById('pb-pay');
  err.hidden = true;
  if (!bag.length) return;
  if (!form.reportValidity()) return;
  const fd = new FormData(form);
  btn.disabled = true; btn.textContent = 'One moment...';
  let res = null, body = {};
  try {
    res = await fetch('api/order', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        lines: bag.map(l => ({ variationId: l.variationId, quantity: l.quantity, modifierIds: l.modifierIds })),
        pickupAt: fd.get('when') || 'asap', name: fd.get('name'), phone: fd.get('phone'), note: fd.get('note'),
      }),
    });
    body = await res.json().catch(() => ({}));
  } catch (e) { res = null; }
  if (res && res.ok && body.ok && body.url) {
    /* The bag clears on the way out; Square holds the order from here. */
    bag = []; saveBag();
    location.href = body.url;
    return;
  }
  err.textContent = body.error || 'Could not reach Square. Try again, or order at the bar.';
  err.hidden = false;
  btn.disabled = false; btn.textContent = 'Pay with Square';
}

/* Back from Square with ?ordered=1: a line under the heading, once. */
function thanks() {
  const q = new URLSearchParams(location.search);
  if (q.get('ordered') !== '1') return;
  bag = []; saveBag(); renderBag();
  const line = document.getElementById('menu-pickup');
  line.innerHTML = 'Thank you. The bar has your order; the receipt is in your email. 821 Traction Ave, Arts District, Downtown LA.';
  history.replaceState(null, '', location.pathname + '#menu');
}
