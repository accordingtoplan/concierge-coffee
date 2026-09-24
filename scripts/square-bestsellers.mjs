/* ── BEST SELLERS FROM SQUARE ──
   Counts what the LA bar sold, by drink, over the last N days, from the
   Orders API, and says which of them the site offers. Run from the site
   folder:

     node scripts/square-bestsellers.mjs [days]        (default 30)

   The token is read from .dev.vars (SQUARE_ACCESS_TOKEN=...) or the
   environment, never printed, never committed: .dev.vars is gitignored.
   Read-only: one search call per page of orders. */

import { readFileSync } from 'node:fs';
import { MENU, LIVE, LOCATION_ID } from '../functions/_lib/menu.js';

const days = Math.max(1, parseInt(process.argv[2] || '30', 10));
let token = process.env.SQUARE_ACCESS_TOKEN || '';
if (!token) {
  try {
    const m = readFileSync('.dev.vars', 'utf8').match(/^SQUARE_ACCESS_TOKEN\s*=\s*"?([^"\n]+)"?/m);
    token = m ? m[1].trim() : '';
  } catch (e) { /* no file */ }
}
if (!token) {
  console.error('No token. Put SQUARE_ACCESS_TOKEN=... in .dev.vars (gitignored) or the environment.');
  process.exit(1);
}

const base = process.env.SQUARE_ENV === 'sandbox' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';
const since = new Date(Date.now() - days * 86400000).toISOString();
const byVariation = new Map(); for (const m of MENU) for (const s of m.sizes) byVariation.set(s.id, m);

const counts = new Map();   // name -> { qty, cents, key }
let cursor, orders = 0, pages = 0;
do {
  const res = await fetch(base + '/v2/orders/search', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Square-Version': '2025-01-23' },
    body: JSON.stringify({
      location_ids: [LOCATION_ID], limit: 500, cursor,
      query: { filter: { state_filter: { states: ['COMPLETED'] }, date_time_filter: { closed_at: { start_at: since } } },
               sort: { sort_field: 'CLOSED_AT', sort_order: 'DESC' } },
    }),
  });
  const body = await res.json();
  if (!res.ok) { console.error('Square answered', res.status, JSON.stringify(body.errors || body).slice(0, 300)); process.exit(1); }
  pages++;
  for (const o of body.orders || []) {
    orders++;
    for (const li of o.line_items || []) {
      const menuItem = byVariation.get(li.catalog_object_id);
      const name = menuItem ? menuItem.name : (li.name || '?');
      const qty = parseFloat(li.quantity || '1');
      const row = counts.get(name) || { qty: 0, cents: 0, key: menuItem?.key || null };
      row.qty += qty; row.cents += li.gross_sales_money?.amount || 0;
      counts.set(name, row);
    }
  }
  cursor = body.cursor;
} while (cursor);

const rows = [...counts.entries()].sort((a, b) => b[1].qty - a[1].qty);
const total = rows.reduce((s, [, r]) => s + r.qty, 0);
console.log(`Last ${days} days, location ${LOCATION_ID}: ${orders} completed orders in ${pages} page(s), ${total} items.\n`);
console.log('rank  qty    share   gross      on site  drink');
rows.slice(0, 30).forEach(([name, r], i) => {
  const onSite = r.key ? (LIVE.includes(r.key) ? 'yes' : 'no ') : ' - ';
  console.log(`${String(i + 1).padStart(3)}   ${String(r.qty).padStart(4)}  ${(100 * r.qty / total).toFixed(1).padStart(5)}%  $${(r.cents / 100).toFixed(2).padStart(8)}   ${onSite}     ${name}${r.key ? '' : '   (not in menu.js)'}`);
});
