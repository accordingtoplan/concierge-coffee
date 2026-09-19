/* ── SQUARE, THE ONE CLIENT ──
   Everything the two pick-up functions need to talk to Square. The token
   lives in the Pages project as SQUARE_ACCESS_TOKEN and nowhere else.

   Environment, set in the Pages project (production and preview):
     SQUARE_ACCESS_TOKEN  production token of the Concierge application,
                          scopes ORDERS_WRITE, PAYMENTS_WRITE, ITEMS_READ
     SQUARE_ENV           "production" (default) or "sandbox"
     SQUARE_VERSION       Square-Version header, default 2025-01-23 */

const HOSTS = {
  production: 'https://connect.squareup.com',
  sandbox: 'https://connect.squareupsandbox.com',
};

export function squareHost(env) {
  return HOSTS[env.SQUARE_ENV === 'sandbox' ? 'sandbox' : 'production'];
}

/* One call. Returns { ok, status, body }. Never throws on a Square error;
   the caller decides what the customer hears. */
export async function square(env, method, path, body) {
  if (!env.SQUARE_ACCESS_TOKEN) {
    console.error('SQUARE_ACCESS_TOKEN is not set on this Pages project');
    return { ok: false, status: 500, body: { errors: [{ detail: 'Ordering is not set up on this host yet. Order at the bar, or try again later.' }] } };
  }
  const res = await fetch(squareHost(env) + path, {
    method,
    headers: {
      Authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
      'Square-Version': env.SQUARE_VERSION || '2025-01-23',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try { json = await res.json(); } catch (e) { /* empty body */ }
  return { ok: res.ok, status: res.status, body: json };
}

/* Square's first error message, or a plain fallback. Never the raw JSON. */
export function squareError(result, fallback) {
  const e = result?.body?.errors?.[0];
  return e?.detail || e?.code || fallback;
}

export function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });
}

/* ── BAR HOURS, SERVER SIDE ──
   The same table as shopify.js, so a pick-up time the page offered is one
   the function accepts. Los Angeles time regardless of where the request
   comes from. Mon to Fri 7am to 5pm, Sat and Sun 8am to 5pm. */
export const BAR_TZ = 'America/Los_Angeles';
export const BAR_HOURS = { 0: [8, 17], 1: [7, 17], 2: [7, 17], 3: [7, 17], 4: [7, 17], 5: [7, 17], 6: [8, 17] };

export function laParts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BAR_TZ, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(date);
  const get = t => parts.find(p => p.type === t)?.value;
  return {
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
    minutes: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10),
    ymd: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

export function barOpenAt(date) {
  const { day, minutes } = laParts(date);
  const [open, close] = BAR_HOURS[day];
  return minutes >= open * 60 && minutes < close * 60;
}
