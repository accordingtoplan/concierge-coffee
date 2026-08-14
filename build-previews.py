#!/usr/bin/env python3
"""Generate three layout previews for Coffee Specialties and Merch.

Each preview is the whole homepage with those two sections restyled, so the
comparison is made in context rather than against a sketch. Everything else --
hero, shop grid, footer, Shopify wiring -- is byte-identical to index.html, and
regenerating is a matter of re-running this file after index.html moves on.

    python3 build-previews.py

Writes preview-rail.html, preview-editorial.html, preview-twocol.html.
These are scratch. Delete them once a direction is chosen.
"""
import re
import sys

SRC = "index.html"

VARIANTS = ["rail", "editorial", "twocol"]
TITLES = {
    "rail": "Sideways rail",
    "editorial": "Editorial lead",
    "twocol": "Two-column",
}

# ── the switcher, so three pages can be flipped between on a phone ──
SWITCHER_CSS = """
  /* Preview chrome. Not part of the site. */
  .pv-bar {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 200;
    display: flex; background: #111; color: #fff;
    font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  }
  .pv-bar a {
    flex: 1; text-align: center; padding: 14px 4px; color: rgba(255,255,255,0.55);
    display: flex; align-items: center; justify-content: center; min-height: 44px;
  }
  .pv-bar a.on { color: #fff; }
  body { padding-bottom: 52px; }
  .cart-drawer, .pdp-overlay { z-index: 300; }
"""


def switcher(active):
    parts = []
    for v in VARIANTS:
        cls = ' class="on"' if v == active else ""
        parts.append(f'<a href="preview-{v}.html"{cls}>{TITLES[v]}</a>')
    return '\n<div class="pv-bar">' + "".join(parts) + "</div>\n"


# ── A. sideways rail ─────────────────────────────────────────────────────────
# Menu becomes a horizontally scrolling rail; merch goes two up and larger.
# No markup change at all -- the grid is re-flowed by CSS alone.
RAIL_CSS = """
  /* ── PREVIEW A: SIDEWAYS RAIL ── */
  .menu-grid {
    grid-template-columns: none;
    grid-auto-flow: column;
    /* a fixed track, not minmax(0, ...): a track with a zero minimum is
       compressed back to fit the container and the rail silently stops
       scrolling */
    grid-auto-columns: 25vw;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    /* bleed into the gutter so a card is cut by the page edge and the rail
       reads as scrollable without a scrollbar or an instruction */
    margin-right: -32px;
    padding-right: 32px;
  }
  .menu-grid::-webkit-scrollbar { display: none; }
  .menu-card { scroll-snap-align: start; }
  .menu-card .card-img { aspect-ratio: 3/4; }

  .menu-note::after { content: '   \\2190 \\2192'; letter-spacing: 0.2em; }

  /* Merch is four items, so it does not need a catalogue grid. Two up and
     larger, in a squarer frame than the shop cards. */
  #merch .grid { grid-template-columns: repeat(2, 1fr); gap: 2px; }
  #merch .card-img { aspect-ratio: 4/3; }

  @media (max-width: 1024px) {
    .menu-grid { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 34vw; margin-right: -24px; padding-right: 24px; }
  }
  @media (max-width: 768px) {
    .menu-grid { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 62vw; margin-right: -16px; padding-right: 16px; }
    #merch .card-img { aspect-ratio: 1/1; }
  }
  @media (max-width: 480px) {
    .menu-grid { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 68vw; margin-right: -14px; padding-right: 14px; }
    #merch .grid { grid-template-columns: 1fr; }
    #merch .card-img { aspect-ratio: 4/3; }
  }
"""

# ── B. editorial lead ────────────────────────────────────────────────────────
EDITORIAL_CSS = """
  /* ── PREVIEW B: EDITORIAL LEAD ──
     A split spread rather than a full-bleed band. Every drink and merch
     photograph in the library is portrait 3/4 or square, and a 21/9 band cut
     from a portrait frame gave a hand and a phone with the drink out of shot.
     The lead keeps the picture close to its native crop and puts the type
     beside it, which is the same magazine device and does not fight the
     asset. If landscape originals ever arrive, the band becomes possible. */
  .menu-lead {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
    margin-bottom: 26px;
    color: inherit;
  }
  .menu-lead .card-img { aspect-ratio: 4/5; }
  .menu-lead .card-img img { transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
  .menu-lead:hover .card-img img { transform: scale(1.04); }

  .lead-face {
    display: flex; flex-direction: column; justify-content: center;
    padding: 0 clamp(20px, 4vw, 72px);
  }
  .lead-kicker {
    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 14px;
  }
  .lead-name { font-family: var(--serif); font-size: clamp(30px, 4.4vw, 60px); line-height: 1.02; }
  .lead-cat { font-size: 13px; line-height: 1.75; margin-top: 16px; max-width: 32ch; color: var(--muted); }
  .lead-note { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 26px; }

  /* ── merch as a teaser rather than a shelf ──
     Nothing here is purchasable -- every price reads an em dash -- so a four
     card product grid dresses an empty shop as a full one. The spread is
     reversed against the menu lead, type left and picture right, so the two
     devices do not read as the same block twice. */
  .merch-teaser {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
    margin-bottom: 26px;
  }
  .merch-teaser .card-img { aspect-ratio: 4/5; order: 2; }
  .merch-teaser .teaser-face {
    order: 1;
    display: flex; flex-direction: column; justify-content: center;
    padding: 0 clamp(20px, 4vw, 72px);
  }
  .teaser-name { font-family: var(--serif); font-size: clamp(30px, 4.4vw, 60px); line-height: 1.02; }
  .teaser-sub { font-size: 13px; line-height: 1.75; margin-top: 16px; color: var(--muted); }
  .teaser-note { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 26px; }

  /* Square and captioned only by name, so the strip cannot be mistaken for
     the 3/4 product cards in the shop above. */
  .merch-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .merch-strip .card-img { aspect-ratio: 1/1; }
  .merch-strip .card-info { padding: 8px 0 0; }

  @media (max-width: 768px) {
    .menu-lead, .merch-teaser { grid-template-columns: 1fr; margin-bottom: 22px; }
    .menu-lead .card-img, .merch-teaser .card-img { aspect-ratio: 4/3; order: 0; }
    .lead-face, .merch-teaser .teaser-face { order: 0; padding: 16px 0 0; }
    .lead-cat, .teaser-sub { max-width: none; margin-top: 10px; }
    .lead-note, .teaser-note { margin-top: 16px; }
  }
"""

# ── C. two column, type beside the photograph ────────────────────────────────
TWOCOL_CSS = """
  /* ── PREVIEW C: TWO COLUMN, TYPE BESIDE ── */
  .menu-grid, #merch .grid {
    grid-template-columns: repeat(2, 1fr);
    column-gap: 28px;
    row-gap: 28px;
  }

  /* a.menu-card, not just .menu-card: the base sets `a.menu-card { display:
     block }` at (0,1,1), which beats a bare class and left the three linked
     drink cards stacked while the other five sat side by side. Same trap as
     the hero shift rule -- a type-qualified selector earlier in the file
     quietly outranks the class you add later. */
  .menu-card, a.menu-card, .merch-card {
    display: grid;
    grid-template-columns: 40% 1fr;
    column-gap: 16px;
    align-items: start;
  }
  .menu-card .card-img, .merch-card .card-img { aspect-ratio: 4/3; }
  .menu-card .card-info, .merch-card .card-info {
    padding: 0;
    display: block;
  }
  .menu-card .card-name, .merch-card .card-name { font-size: 16px; line-height: 1.2; }
  .menu-card .card-cat, .merch-card .card-sub { margin-top: 6px; line-height: 1.55; }
  .merch-card .card-price { display: none; }

  /* One per row on a phone, but still photograph left and type right: at
     phone width that reads as a menu list, which is what it is. */
  @media (max-width: 768px) {
    .menu-grid, #merch .grid { grid-template-columns: 1fr; row-gap: 20px; }
    .menu-card, a.menu-card, .merch-card { grid-template-columns: 34% 1fr; }
    .menu-card .card-name, .merch-card .card-name { font-size: 15px; }
  }
  @media (max-width: 480px) {
    .menu-card, a.menu-card, .merch-card { grid-template-columns: 38% 1fr; column-gap: 12px; }
  }
"""


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def split_menu_cards(html):
    """Return (head_html, [card_html, ...], tail_html) for the menu grid."""
    m = re.search(r'(<div class="menu-grid">\n)(.*?)(\n  </div>\n</section>)', html, re.S)
    if not m:
        sys.exit("could not find the menu grid")
    body = m.group(2)
    # cards are either <div class="card menu-card"> or <a class="card menu-card" ...>
    starts = [x.start() for x in re.finditer(r'^    <(?:div|a) class="card menu-card"', body, re.M)]
    if len(starts) != 8:
        sys.exit(f"expected 8 drink cards, found {len(starts)}")
    bounds = starts + [len(body)]
    cards = [body[bounds[i]:bounds[i + 1]].rstrip("\n") for i in range(8)]
    return m, cards


def build_editorial(html):
    m, cards = split_menu_cards(html)

    lead_src = cards[0]
    tag = "a" if lead_src.lstrip().startswith("<a") else "div"
    href = ""
    if tag == "a":
        h = re.search(r'href="([^"]+)"', lead_src)
        href = f' href="{h.group(1)}" target="_blank" rel="noopener noreferrer"' if h else ""
    img = re.search(r'<img src="([^"]+)" alt="([^"]+)"', lead_src)
    name = re.search(r'<div class="card-name">(.*?)</div>', lead_src, re.S).group(1).strip()
    cat = re.search(r'<div class="card-cat">(.*?)</div>', lead_src, re.S).group(1).strip()

    lead = f'''  <{tag} class="menu-lead"{href}>
    <div class="card-img">
      <img src="{img.group(1)}" alt="{img.group(2)}" />
    </div>
    <div class="lead-face">
      <div class="lead-kicker">Signature</div>
      <div class="lead-name">{name}</div>
      <div class="lead-cat">{cat}</div>
      <div class="lead-note">Served at 821 Traction Ave</div>
    </div>
  </{tag}>
'''

    rest = "\n".join(cards[1:])
    new_menu = m.group(1) + rest + m.group(3)
    html = html[:m.start()] + lead + new_menu + html[m.end():]

    # merch: one teaser band plus a square filmstrip
    merch = re.search(r'<section class="shop" id="merch">.*?\n</section>', html, re.S)
    if not merch:
        sys.exit("could not find the merch section")
    new_merch = '''<section class="shop" id="merch">
  <div class="shop-head">
    <span class="shop-title">Merch</span>
  </div>
  <div class="merch-teaser">
    <div class="card-img card-img--slide">
      <img class="slide-img slide-img--1" src="images/merch-rc-car-1.jpg" alt="RC-Car" />
      <img class="slide-img slide-img--2" src="images/merch-rc-car-2.jpg" alt="RC-Car" />
    </div>
    <div class="teaser-face">
      <div class="teaser-name">RC-Car</div>
      <div class="teaser-sub">Limited Edition, custom livery. Built for the shop, not for the shelf.</div>
      <div class="teaser-note">In store at 821 Traction Ave</div>
    </div>
  </div>
  <div class="merch-strip">
    <div class="card merch-card">
      <div class="card-img" style="background:#f7f7f7">
        <img src="images/merch-waterbottle.webp" alt="Water Bottle" style="object-fit:cover" loading="lazy" />
      </div>
      <div class="card-info">
        <div><div class="card-name">Water Bottle</div><div class="card-sub">KINTO</div></div>
        <div class="card-price">&#8212;</div>
      </div>
    </div>
    <div class="card merch-card">
      <div class="card-img" style="background:#f7f7f7">
        <img src="images/merch-tshirt.jpg" alt="T-Shirt" loading="lazy" />
      </div>
      <div class="card-info">
        <div><div class="card-name">T-Shirt</div><div class="card-sub">Limited Edition</div></div>
        <div class="card-price">&#8212;</div>
      </div>
    </div>
    <div class="card merch-card">
      <div class="card-img" style="background:#f7f7f7">
        <img src="images/merch-sweater.jpg" alt="Sweater" loading="lazy" />
      </div>
      <div class="card-info">
        <div><div class="card-name">Sweater</div><div class="card-sub">Reverse Weave</div></div>
        <div class="card-price">&#8212;</div>
      </div>
    </div>
  </div>
</section>'''
    return html[:merch.start()] + new_merch + html[merch.end():]


def main():
    base = read(SRC)
    if "</style>" not in base or "</body>" not in base:
        sys.exit("index.html is not shaped the way this script expects")

    for v in VARIANTS:
        html = base
        if v == "editorial":
            html = build_editorial(html)
        css = {"rail": RAIL_CSS, "editorial": EDITORIAL_CSS, "twocol": TWOCOL_CSS}[v]
        html = html.replace("\n</style>", "\n" + css + SWITCHER_CSS + "\n</style>", 1)
        html = html.replace("</body>", switcher(v) + "</body>", 1)
        html = html.replace(
            "<title>", f"<!-- PREVIEW: {TITLES[v]} — generated by build-previews.py, not for launch -->\n<title>", 1
        )
        out = f"preview-{v}.html"
        with open(out, "w", encoding="utf-8") as fh:
            fh.write(html)
        print(f"wrote {out}  ({len(html):,} bytes)")


main()
