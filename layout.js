/* ── LAYOUT ──
   The navigation and the footer for all six pages, injected the way the bag
   and the order panel already are, so the pages cannot drift apart. Each
   page keeps an empty <nav> and <footer> and loads this module; the markup
   lives here and only here. The crossed keys and the wordmark reference the
   SVG symbols every page already defines. */

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
      <li><a href="shop.html#merch">Merch</a></li>
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

/* The current page gets its nav link marked, read from the address rather
   than written six times into six files. */
const here = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-r a[href]').forEach(a => {
  if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
});
