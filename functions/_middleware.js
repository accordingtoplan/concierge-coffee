/* ── SOFT LAUNCH ──
   Cloudflare Pages middleware, runs before every request on this host.
   While SOFT_LAUNCH_PASSWORD is set on the Pages project, the site asks
   the browser for a username and password (any username, that password)
   and answers 401 to everyone else, search engines included. Remove the
   variable and redeploy, and the door is open; nothing else changes.

   The password lives only in the Pages project settings. Shopify's
   checkout and Square's pages are other hosts and are never behind this. */

export async function onRequest({ request, env, next }) {
  const secret = env.SOFT_LAUNCH_PASSWORD;
  if (!secret) return next();

  const header = request.headers.get('Authorization') || '';
  if (header.startsWith('Basic ')) {
    let decoded = '';
    try { decoded = atob(header.slice(6)); } catch (e) { decoded = ''; }
    const password = decoded.slice(decoded.indexOf(':') + 1);
    if (decoded.includes(':') && safeEqual(password, secret)) return next();
  }

  return new Response('Concierge Coffee. Not open yet.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Concierge Coffee", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

/* Same length, same bytes, in constant time. */
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
