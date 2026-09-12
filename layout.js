/* ── LAYOUT ──
   The navigation and the footer for all six pages, injected the way the bag
   and the order panel already are, so the pages cannot drift apart. Each
   page keeps an empty <nav> and <footer> and loads this module; the markup
   lives here and only here. The crossed keys and the wordmark reference the
   SVG symbols every page already defines. */

/* Where "order ahead" points once order.conciergecoffee.com exists (item 8
   of the September handover). Empty until then, and the pages say where the
   bar is instead of linking anywhere. Lives here rather than in shopify.js
   so the content pages get it without loading the storefront. */
export const ORDER_URL = '';

const NAV = `
  <a href="index.html" class="logo" aria-label="Concierge Coffee &mdash; home">
    <svg class="lk" viewBox="0 0 151.07 120.06" aria-hidden="true"><use href="#cc-keys"/></svg>
    <svg class="lw" viewBox="0 0 415.33 88.96" aria-hidden="true"><use href="#cc-word"/></svg>
  </a>
  <div class="nav-r">
    <a href="index.html">Home</a>
    <a href="shop.html">Shop</a>
    <a href="arrangements.html">Arrangements</a>
    <a href="about.html">About</a>
    <a href="visit.html">Visit</a>
    <a href="#" role="button" onclick="event.preventDefault(); openCart()" id="bag-link">Bag (0)</a>
  </div>
  <button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false" onclick="toggleNav()">
    <span></span><span></span>
  </button>
`;

const FOOTER = `
  <div class="ft-brand">
    <div class="ft-logo">
      <svg class="lk" viewBox="0 0 151.07 120.06" aria-hidden="true"><use href="#cc-keys"/></svg>
      <svg class="lw" viewBox="0 0 415.33 88.96" role="img" aria-label="Concierge Coffee"><use href="#cc-word"/></svg>
    </div>
    <div class="ft-addr">
      <a href="https://maps.app.goo.gl/CeXuHqDg2wRRmApQ6" target="_blank" rel="noopener">821 Traction Ave<br>Los Angeles, CA 90013</a>
      <a class="ft-city" href="https://maps.app.goo.gl/ESjak6LpyHTXgknbA" target="_blank" rel="noopener">Lützowstraße 92<br>10785 Berlin</a>
    </div>
  </div>
  <div class="ft-col ft-col--shop">
    <div class="ft-h">Shop</div>
    <ul class="ft-links" id="footer-links">
      <li><a href="shop.html">Coffee</a></li>
      <li><a href="index.html#menu">Drinks</a></li>
    </ul>
  </div>
  <div class="ft-col ft-col--info">
    <div class="ft-h">Info</div>
    <ul class="ft-links">
      <li><a href="visit.html">Visit</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="arrangements.html">Arrangements</a></li>
    </ul>
  </div>
  <div class="ft-copy">
    <span>&copy; 2026 Concierge Coffee LLC</span>
    <a href="https://www.instagram.com/conciergecoffee/" target="_blank" rel="noopener">Instagram</a>
    <a class="ft-credit" href="https://frederikfrede.com" target="_blank" rel="noopener">Design</a>
  </div>
`;

document.querySelectorAll('nav').forEach(n => { n.innerHTML = NAV; });
document.querySelectorAll('footer').forEach(f => { f.innerHTML = FOOTER; });

/* Pick-up orders live in Square Online. The footer carries the link once
   the ordering subdomain exists; until then the Shop column is as above. */
if (ORDER_URL) {
  document.querySelectorAll('#footer-links').forEach(ul => {
    ul.insertAdjacentHTML('beforeend',
      `<li><a href="${ORDER_URL}" target="_blank" rel="noopener">Order for pick-up</a></li>`);
  });
}

/* The current page gets its nav link marked, read from the address rather
   than written six times into six files. Cloudflare Pages serves
   /shop.html at /shop, so the comparison drops the extension on both sides. */
const clean = s => (s.replace(/\.html$/, '') || 'index');
const here = clean(location.pathname.split('/').pop());
document.querySelectorAll('.nav-r a[href]').forEach(a => {
  if (clean(a.getAttribute('href')) === here) a.setAttribute('aria-current', 'page');
});

/* A tap on a link in the open sheet closes the sheet. This has to run
   here, after the nav exists: the page scripts ran before it did and
   found nothing to listen to. toggleNav is each page's own. */
document.querySelectorAll('.nav-r a').forEach(a =>
  a.addEventListener('click', () => window.toggleNav?.(false)));
