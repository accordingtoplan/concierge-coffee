/* ── PICK-UP MENU ──
   Cloudflare Pages Function, GET /api/menu. Takes the curated menu in
   _lib/menu.js and fills it with what only Square knows: the price of each
   size, and the options and prices of each modifier list. The page renders
   from this and never talks to Square itself. Cached five minutes at the
   edge, so a price change in the POS reaches the site within that.

   Only runs on Cloudflare Pages. On GitHub Pages the path is a 404 and the
   homepage falls back to the four-photograph menu. Test locally with
   `npx wrangler pages dev .` and a `.dev.vars` holding SQUARE_ACCESS_TOKEN. */

import { MENU, LISTS, SECTIONS, variationIds } from '../_lib/menu.js';
import { square, squareError, json } from '../_lib/square.js';

const TTL = 300;

export async function onRequestGet({ request, env }) {
  const cache = caches.default;
  const key = new Request(new URL(request.url).origin + '/api/menu', { method: 'GET' });
  const hit = await cache.match(key);
  if (hit) return hit;

  const ids = [...variationIds, ...Object.keys(LISTS)];
  const res = await square(env, 'POST', '/v2/catalog/batch-retrieve', { object_ids: ids, include_related_objects: false });
  if (!res.ok) return json(502, { ok: false, error: squareError(res, 'The menu is not answering just now.') });

  const objects = new Map((res.body.objects || []).map(o => [o.id, o]));

  const lists = {};
  for (const [id, cfg] of Object.entries(LISTS)) {
    const o = objects.get(id);
    if (!o || o.is_deleted) continue;
    lists[id] = {
      id, name: cfg.name, mode: cfg.mode, none: cfg.none,
      options: (o.modifier_list_data?.modifiers || [])
        .filter(m => !m.is_deleted)
        .map(m => ({ id: m.id, name: m.modifier_data?.name || '', price: m.modifier_data?.price_money?.amount || 0 })),
    };
  }

  const items = MENU.map(m => {
    const sizes = m.sizes.map(s => {
      const o = objects.get(s.id);
      const v = o?.item_variation_data;
      const price = v?.price_money?.amount;
      return { id: s.id, label: s.label, price: typeof price === 'number' ? price : null, sellable: !!o && !o.is_deleted && v?.sellable !== false };
    }).filter(s => s.price !== null && s.sellable);
    return { key: m.key, name: m.name, section: m.section, ingredients: m.ingredients, photo: m.photo,
      sizes, lists: m.lists.filter(id => lists[id]) };
  }).filter(m => m.sizes.length);

  const response = json(200, { ok: true, sections: SECTIONS, items, lists, at: new Date().toISOString() },
    { 'Cache-Control': `public, max-age=${TTL}` });
  await cache.put(key, response.clone());
  return response;
}

export function onRequest({ request }) {
  if (request.method === 'GET') return onRequestGet(arguments[0]);
  return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
}
