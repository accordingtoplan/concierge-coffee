# Concierge Coffee, conciergecoffee.com

Static storefront for Concierge Coffee Roasters (Benjamin and Namy, 821 Traction Ave, LA Arts District; also Lützowstraße 92, Berlin). Frederik Frede is the creative consultant on the account; he proposes, they decide. Read this file before touching anything. Read `docs/HANDOVER-2026-09-11.md` for the current round of work.

## What this is

Headless Shopify. Plain HTML, one `styles.css`, two ES modules. No build step, no framework, no bundler. The Shopify Storefront API (public token, meant to be in client code) handles catalogue, cart and checkout. Everything else is static.

| File | Role |
| --- | --- |
| `index.html` | Homepage: hero, coffee selection, drinks menu, Abrazo, merch, About teaser |
| `shop.html` | Catalogue: coffee, proposals, merch as sections |
| `product.html?p=<handle>` | One page per coffee, off the loaded catalogue |
| `about.html`, `visit.html`, `arrangements.html` | Content pages, no storefront code. Arrangements holds events, catering, wholesale and Abrazo |
| `shopify.js` | The storefront: API calls, product query, cart mutations, gram to ounce conversion, the bag drawer and quick add panel (both injected, never written into a page), `shopCardHTML()`. Drinks (`tag: drink`) stay out of every grid; `DRINKS_ORDERABLE` gates the pickup code kept from the September build |
| `layout.js` | Nav and footer markup, injected into every page's empty `<nav>` and `<footer>` |
| `styles.css` | The one stylesheet. Two variant classes carry the only intentional page differences (homepage Abrazo strip, About hero) |
| `images/` | All local, WebP, named `concierge-coffee-<what-it-shows>.webp`, sized to the slot |
| `CNAME`, `robots.txt`, `sitemap.xml`, `404.html` | Hosting files. URLs point at the preview domain until cutover |
| `functions/api/wholesale.js` | Cloudflare Pages Function: mails the wholesale form to orders@ through Resend (`RESEND_API_KEY` in the Pages project). Inert on GitHub Pages, where the page falls back to a `mailto:` |

Store: `concierge-coffee-2245.myshopify.com`, Basic plan. Product handles are load-bearing: the frontend keys fallback images on `p.handle`. Never rename a handle in Shopify without the paired change here.

Repo: `github.com/accordingtoplan/concierge-coffee`, branch `main`. Preview: `concierge-coffee.accordingtoplan.co` (GitHub Pages, interim). Production host from launch: Cloudflare Pages, client-owned account.

## Rules

- **Targeted edits only.** Never rewrite a page. Every page shares `styles.css`, `layout.js` and `shopify.js`; fix the pattern there, not the instance in one page.
- **What a card looks like is the page's business; everything else belongs in `shopify.js`.** Two copies of a buy panel drift.
- **Design is locked:** pure black and white, Helvetica Neue, no decoration, grayscale photography on the homepage, product grid as the centrepiece. No colour, no new type, no icons.
- **Copy voice:** warm, confident, lightly playful, never pretentious. Banned: "artisanal", "third wave", "elevate", "curated", "seamless", "journey", "passionate". No em-dashes, no emojis, short sentences. When in doubt, cut the adjective.
- **Weights:** Shopify carries grams; the site converts to ounces because the shop is in Los Angeles. Never hardcode a weight in HTML.
- **Verify before you say done.** Serve locally (`python3 -m http.server 8765`), check 390, 768 and 1440 wide, no horizontal overflow, zero console errors. Assert at the network layer where you can (read the cart mutation body, not the dropdown). Assert the count, then the contents; a sweep that finds nothing passes silently.
- **Nothing is final.** Drafts stay drafts until Frederik publishes; published work stays open to revision. Do not describe output as final.
- **Frederik pushes.** Write into the working tree, list what changed, leave the commit and push to him unless told otherwise.

## Where things are decided

Notion, `01-Projects / Concierge Coffee / Website Build`, is the source of truth for status and decisions. This file carries the stable rules; the handover carries the current round. When they disagree, Notion wins, and this file gets fixed.
