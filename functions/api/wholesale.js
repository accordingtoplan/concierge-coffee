/* ── WHOLESALE REQUEST ──
   Cloudflare Pages Function, POST /api/wholesale. Receives the form on
   arrangements.html and mails it to orders@conciergecoffee.com through
   Resend. Only runs on Cloudflare Pages; on GitHub Pages there is nothing
   at this path and the page hands the request to the visitor's mail app
   instead. Test locally with `npx wrangler pages dev .` and a `.dev.vars`
   file holding RESEND_API_KEY.

   Environment, set in the Pages project (production and preview):
     RESEND_API_KEY   the Resend key; conciergecoffee.com must be verified
                      in Resend by DNS, or the from address is refused
     WHOLESALE_TO     where requests land, default orders@conciergecoffee.com
     WHOLESALE_FROM   the sender, default Concierge Coffee <orders@conciergecoffee.com> */

const DEFAULT_TO = 'orders@conciergecoffee.com';
const DEFAULT_FROM = 'Concierge Coffee <orders@conciergecoffee.com>';
const FIELDS = ['business', 'name', 'email', 'phone', 'coffees', 'method', 'notes'];
const LABELS = {
  business: 'Business', name: 'Contact', email: 'Email', phone: 'Phone',
  coffees: 'Coffees and kilos a month', method: 'Delivery or pick-up', notes: 'Notes',
};
const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, 2000);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  const type = request.headers.get('content-type') || '';
  const json = type.includes('application/json');
  let raw;
  try {
    raw = json ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return reply(request, json, 400, { ok: false, error: 'Could not read the form.' });
  }

  /* Honeypot: a field no person sees. A bot that fills it gets a yes and
     sends nothing. */
  if (clean(raw.website)) return reply(request, json, 200, { ok: true });

  const d = Object.fromEntries(FIELDS.map(k => [k, clean(raw[k])]));
  const missing = [];
  if (!d.business) missing.push('business');
  if (!d.name) missing.push('name');
  if (!EMAIL.test(d.email)) missing.push('email');
  if (missing.length) {
    return reply(request, json, 400, { ok: false, error: `Missing or not right: ${missing.join(', ')}.` });
  }
  if (!env.RESEND_API_KEY) {
    return reply(request, json, 500, { ok: false, error: 'Mail is not set up on this host.' });
  }

  const text = FIELDS.filter(k => d[k]).map(k => `${LABELS[k]}: ${d[k]}`).join('\n')
    + `\n\nSent from the wholesale form on conciergecoffee.com.`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.WHOLESALE_FROM || DEFAULT_FROM,
      to: [env.WHOLESALE_TO || DEFAULT_TO],
      reply_to: d.email,
      subject: `Wholesale request: ${d.business}`,
      text,
    }),
  });
  if (!res.ok) return reply(request, json, 502, { ok: false, error: 'The mail did not go out. Try again, or write to orders@conciergecoffee.com.' });
  return reply(request, json, 200, { ok: true });
}

/* Anything but POST. Pages routes a POST to onRequestPost first. */
export function onRequest() {
  return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
}

/* Script on the page gets JSON. A plain form post, with script off, goes
   back to the page with the outcome in the query string. */
function reply(request, json, status, body) {
  if (json) {
    return new Response(JSON.stringify(body), {
      status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  const url = new URL('/arrangements.html', request.url);
  if (body.ok) url.searchParams.set('sent', '1');
  else url.searchParams.set('error', body.error || 'Something went wrong.');
  url.hash = 'wholesale';
  return Response.redirect(url.toString(), 303);
}
