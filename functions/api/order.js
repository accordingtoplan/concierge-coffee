/* ── PICK-UP ORDER ──
   Cloudflare Pages Function, POST /api/order. Takes the pick-up bag from
   the homepage, checks every line against the curated menu, and asks
   Square for a hosted checkout link with the order attached: line items by
   catalog id, "To Go" on every line, a PICKUP fulfilment with the name,
   phone and time. The customer pays on Square's page. The paid order lands
   in the POS as a pick-up, the way a Square Online order does, and the
   customer comes back to the homepage with ?ordered=1.

   Nothing is charged here and no card detail ever passes through. See
   _lib/square.js for the environment. */

import { LISTS, TO_GO_MODIFIER, LOCATION_ID, variationOf } from '../_lib/menu.js';
import { square, squareError, json, barOpenAt, laParts, BAR_HOURS } from '../_lib/square.js';

const MAX_LINES = 20;
const MAX_QTY = 10;
const PREP = 'PT10M';
const SUPPORT = 'hello@conciergecoffee.com';
const clean = (v, n = 120) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const PHONE = /^\+?[0-9 ()-]{7,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  let raw;
  try { raw = await request.json(); } catch (e) { return json(400, { ok: false, error: 'Could not read the order.' }); }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) raw = {};

  const name = clean(raw.name, 80);
  const phone = clean(raw.phone, 24);
  const email = clean(raw.email, 120);
  const note = clean(raw.note, 300);
  if (!name) return json(400, { ok: false, error: 'A name for the order, please.' });
  if (!PHONE.test(phone)) return json(400, { ok: false, error: 'A phone number we can reach you on, please.' });
  if (email && !EMAIL.test(email)) return json(400, { ok: false, error: 'That email does not look right.' });

  /* Lines: every id must be one the menu offers, every modifier must belong
     to a list that item carries, quantities are small whole numbers. */
  const lines = Array.isArray(raw.lines) ? raw.lines.slice(0, MAX_LINES) : [];
  if (!lines.length) return json(400, { ok: false, error: 'The order is empty.' });
  const line_items = [];
  for (const l of lines) {
    const found = variationOf(String(l?.variationId || ''));
    if (!found) return json(400, { ok: false, error: 'One of the drinks is no longer on the menu. Refresh and try again.' });
    const qty = Math.floor(Number(l.quantity));
    if (!(qty >= 1 && qty <= MAX_QTY)) return json(400, { ok: false, error: 'Up to ten of each drink, please.' });
    const allowed = new Set(found.item.lists);
    const mods = [];
    for (const id of Array.isArray(l.modifierIds) ? l.modifierIds.slice(0, 12) : []) {
      const listId = Object.keys(LISTS).find(k => modifierBelongs(k, id));
      /* The list a modifier belongs to is not known from its id alone; the
         page sends listId with each choice, and it has to be one the item
         carries. */
      if (!listId) return json(400, { ok: false, error: 'One of the options is not available. Refresh and try again.' });
      if (!allowed.has(listId)) return json(400, { ok: false, error: 'One of the options does not fit that drink.' });
      mods.push({ catalog_object_id: String(id).split(':')[1] });
    }
    mods.push({ catalog_object_id: TO_GO_MODIFIER });
    line_items.push({ catalog_object_id: found.size.id, quantity: String(qty), modifiers: mods,
      ...(l.note ? { note: clean(l.note, 120) } : {}) });
  }

  /* When. "asap" or an ISO time the bar is open at, within the next day. */
  const when = String(raw.pickupAt || 'asap');
  let pickup_details;
  if (when === 'asap') {
    if (!barOpenAt(new Date(Date.now()))) return json(400, { ok: false, error: `The bar is closed just now. Opens ${opensAt()}.` });
    pickup_details = { schedule_type: 'ASAP', prep_time_duration: PREP };
  } else {
    const t = new Date(when);
    if (isNaN(t) || t.getTime() < Date.now() - 60e3 || t.getTime() > Date.now() + 36 * 3600e3) {
      return json(400, { ok: false, error: 'That pick-up time has passed. Pick another.' });
    }
    if (!barOpenAt(t)) return json(400, { ok: false, error: 'The bar is closed at that time. Pick another.' });
    pickup_details = { schedule_type: 'SCHEDULED', pickup_at: t.toISOString(), prep_time_duration: PREP };
  }
  pickup_details.recipient = { display_name: name, phone_number: phone, ...(email ? { email_address: email } : {}) };
  if (note) pickup_details.note = note;

  /* ── TEST ORDER ──
     While PICKUP_TEST_WORD is set on the Pages project (Settings, Variables
     and Secrets, Production, then retry the deployment), an order whose
     "Anything for the bar" note carries that word is discounted to one
     dollar before tax. Square will not take a card payment under a dollar,
     and a dollar proves what a free order could not: the ticket, the tax
     line and the refund from the POS. The word stays in the note, so the
     bar sees it is a test. Delete the variable when testing is done. */
  let discounts;
  const testWord = String(env.PICKUP_TEST_WORD || '').trim();
  if (testWord && note.toLowerCase().includes(testWord.toLowerCase())) {
    const cents = await subtotalCents(env, line_items);
    if (cents === null) return json(502, { ok: false, error: 'Could not price the test order. Try again in a moment.' });
    if (cents > 100) discounts = [{ name: 'Site test', scope: 'ORDER', amount_money: { amount: cents - 100, currency: 'USD' } }];
  }

  const origin = new URL(request.url).origin;
  const res = await square(env, 'POST', '/v2/online-checkout/payment-links', {
    idempotency_key: crypto.randomUUID(),
    order: {
      location_id: env.SQUARE_LOCATION_ID || LOCATION_ID,
      reference_id: `${discounts ? 'test' : 'web'}-${Date.now().toString(36)}`,
      source: { name: 'conciergecoffee.com' },
      line_items,
      ...(discounts ? { discounts } : {}),
      fulfillments: [{ type: 'PICKUP', state: 'PROPOSED', pickup_details }],
    },
    checkout_options: {
      redirect_url: `${origin}/index.html?ordered=1#menu`,
      ask_for_shipping_address: false,
      allow_tipping: true,
      merchant_support_email: SUPPORT,
    },
    pre_populated_data: { buyer_phone_number: phone, ...(email ? { buyer_email: email } : {}) },
    payment_note: `Pick-up for ${name}, 821 Traction Ave`,
  });
  if (!res.ok) return json(502, { ok: false, error: squareError(res, 'Square did not take the order. Try again, or order at the bar.') });
  const url = res.body?.payment_link?.url;
  if (!url) return json(502, { ok: false, error: 'Square did not return a checkout. Try again in a moment.' });
  return json(200, { ok: true, url, orderId: res.body?.payment_link?.order_id || null });
}

/* What the lines come to before tax, from the catalog: each variation's
   price plus its modifiers', times the quantity. Null if Square does not
   answer or a price is missing. Only the test order needs it. */
async function subtotalCents(env, line_items) {
  const ids = [...new Set(line_items.flatMap(l => [l.catalog_object_id, ...l.modifiers.map(m => m.catalog_object_id)]))];
  const res = await square(env, 'POST', '/v2/catalog/batch-retrieve', { object_ids: ids, include_related_objects: false });
  if (!res.ok) return null;
  const price = new Map((res.body.objects || []).map(o => [o.id, o.item_variation_data?.price_money?.amount ?? o.modifier_data?.price_money?.amount ?? 0]));
  let total = 0;
  for (const l of line_items) {
    if (!price.has(l.catalog_object_id)) return null;
    const unit = price.get(l.catalog_object_id) + l.modifiers.reduce((s, m) => s + (price.get(m.catalog_object_id) || 0), 0);
    total += unit * Number(l.quantity);
  }
  return total;
}

/* The page sends each chosen modifier as "listId:modifierId", so the
   server can check the list without another catalog call. */
function modifierBelongs(listId, tagged) {
  return String(tagged).startsWith(listId + ':');
}

function opensAt() {
  const { day, minutes } = laParts(new Date(Date.now()));
  const today = BAR_HOURS[day];
  const hour = minutes < today[0] * 60 ? today[0] : BAR_HOURS[(day + 1) % 7][0];
  return `${hour}am`;
}

export function onRequest({ request }) {
  if (request.method === 'POST') return onRequestPost(arguments[0]);
  return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
}
