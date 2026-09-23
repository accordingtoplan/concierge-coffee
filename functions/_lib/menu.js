/* ── PICK-UP MENU, THE ONE SOURCE ──
   What the site offers for pick-up, keyed to Square catalog ids. Names,
   sections, ingredient lines and photographs are decided here; prices and
   modifier options come from Square live, so Benjamin changes a price in
   the POS and the site follows. To add a drink: find its variation id in
   the Square catalog and add an entry. To retire one: remove the entry.
   Square's "Here / To Go" list is never shown; every pick-up line carries
   "To Go" automatically. Built 18 Sep 2026 from the LA catalog. */

export const LOCATION_ID = 'LBQ57S4FMANAA';
export const TO_GO_MODIFIER = '6IESBDUOSQGZRWKQBYD75JFS';

/* Modifier lists the site renders, and how. "one" is a single choice with
   an optional no-charge default; "many" is checkboxes. Lists not named here
   are not shown even if Square attaches them to the item. */
export const LISTS = {
  "JHKNCQM4YSDQ5CQSXFXBQXWA": {
    "name": "Milk",
    "mode": "one",
    "none": "Whole milk"
  },
  "7FXXZX4VQNWFVRPSV6JRJWRK": {
    "name": "Milk",
    "mode": "one",
    "none": null
  },
  "JIBHSL6QJQRB6WOYUSUXURDG": {
    "name": "Affogato",
    "mode": "one",
    "none": null
  },
  "ID6PQ7M2DQLEE2A56C24OYCA": {
    "name": "Add-ons",
    "mode": "many",
    "none": null
  }
};

export const SECTIONS = ['Signature', 'Espresso', 'Filter', 'Iced', 'Tea & other'];

export const MENU = [
  {
    "key": "einspanner",
    "name": "Einspänner",
    "section": "Signature",
    "ingredients": "Cold brew, double espresso, chocolate, smoked salt, cream top",
    "photo": "images/concierge-coffee-einspanner.webp",
    "sizes": [
      {
        "id": "7Y7B573LWKZROXNZS25EMCQS",
        "label": "Regular"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "yuzu-matcha-tonic",
    "name": "Yuzu Matcha Tonic",
    "section": "Signature",
    "ingredients": "Matcha, yuzu, simple syrup, fresh lime",
    "photo": "images/concierge-coffee-yuzu-matcha-tonic.webp",
    "sizes": [
      {
        "id": "GXPVGVROZAWKQ2KLQVER2BMW",
        "label": "Regular"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "latte-iced",
    "name": "Latte, iced",
    "section": "Iced",
    "ingredients": "Espresso, milk, over ice",
    "photo": "images/concierge-coffee-latte-iced.webp",
    "sizes": [
      {
        "id": "SY67Q3EIUK3KLRVPAQYQWDGO",
        "label": "12 oz"
      },
      {
        "id": "4X45JHWWVKTLW74UISNUF2ZE",
        "label": "16 oz"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA",
      "JHKNCQM4YSDQ5CQSXFXBQXWA"
    ]
  },
  {
    "key": "saffron-latte",
    "name": "Saffron Latte",
    "section": "Signature",
    "ingredients": "Saffron, honey, cinnamon, cardamom, vanilla, double espresso, crushed pistachio, milk",
    "photo": "images/concierge-coffee-saffron-latte.webp",
    "sizes": [
      {
        "id": "MRCVLNSC33NPJPBFOFOWR75S",
        "label": "Hot"
      },
      {
        "id": "YOK4S67DJCMIWQEKNLEPYIDZ",
        "label": "Iced"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA",
      "JHKNCQM4YSDQ5CQSXFXBQXWA"
    ]
  },
  {
    "key": "rose-cream-top",
    "name": "Rose Cream Top",
    "section": "Signature",
    "ingredients": "Cardamom, rose, cream top",
    "photo": null,
    "sizes": [
      {
        "id": "O36VT4EB7MRR4INU4P3JXZD2",
        "label": "Regular"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "citrus-espresso-tonic",
    "name": "Citrus Espresso Tonic",
    "section": "Signature",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "OAGZIJAUFAYTITXYIJBGT7ZM",
        "label": "Regular"
      }
    ],
    "lists": []
  },
  {
    "key": "banana-cream-matcha",
    "name": "Banana Cream Matcha",
    "section": "Signature",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "KUA6SSUONMNWBG3ZZZ7JNK5D",
        "label": "Regular"
      }
    ],
    "lists": [
      "7FXXZX4VQNWFVRPSV6JRJWRK"
    ]
  },
  {
    "key": "affogato",
    "name": "Affogato",
    "section": "Signature",
    "ingredients": "Vanilla ice cream with espresso, matcha or hojicha",
    "photo": null,
    "sizes": [
      {
        "id": "TRB6CNYLJPAHFTCQGBZBYZUR",
        "label": "Regular"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA",
      "JIBHSL6QJQRB6WOYUSUXURDG"
    ]
  },
  {
    "key": "matcha-affogato",
    "name": "Matcha Affogato",
    "section": "Signature",
    "ingredients": "Vanilla ice cream, matcha",
    "photo": null,
    "sizes": [
      {
        "id": "VGATAETYRJBD5GSKJM7BHRZA",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "espresso",
    "name": "Espresso",
    "section": "Espresso",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "3E75A7PV2QKBLLKGBESARMV7",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "macchiato",
    "name": "Espresso Macchiato",
    "section": "Espresso",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "AUMYBSJOUO7TJGVPGMQ47DGH",
        "label": "Regular"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA",
      "JHKNCQM4YSDQ5CQSXFXBQXWA"
    ]
  },
  {
    "key": "cortado",
    "name": "Cortado",
    "section": "Espresso",
    "ingredients": "Espresso, an equal pour of steamed milk",
    "photo": null,
    "sizes": [
      {
        "id": "HN7TM2OEWSJ5TTRHNFVW4UTS",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "flat-white",
    "name": "Flat White",
    "section": "Espresso",
    "ingredients": "Double espresso, steamed milk",
    "photo": null,
    "sizes": [
      {
        "id": "64GXAH3HLHOQKB7ZJSBKIFRW",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "cappuccino",
    "name": "Cappuccino",
    "section": "Espresso",
    "ingredients": "Espresso, foamed milk",
    "photo": null,
    "sizes": [
      {
        "id": "AJHNTLVPHDBAOG6UDF7RHNWV",
        "label": "Regular"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA",
      "JHKNCQM4YSDQ5CQSXFXBQXWA"
    ]
  },
  {
    "key": "latte",
    "name": "Latte",
    "section": "Espresso",
    "ingredients": "Espresso, steamed milk",
    "photo": null,
    "sizes": [
      {
        "id": "GGCQCKERSAEV53FLYS3FDR7T",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "vanilla-latte",
    "name": "Vanilla Latte",
    "section": "Espresso",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "JSMQXWAHPMGK4SZN4JBAXR5V",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "mocha",
    "name": "Mocha",
    "section": "Espresso",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "7D4WWY22WW4FBICFJ5NEZ4BW",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "americano",
    "name": "Americano",
    "section": "Espresso",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "QBMEJ3SM6BUXEEI7OZN4KWAF",
        "label": "8 oz"
      },
      {
        "id": "67WKWTNZYBNV6NOELZ2ISVPQ",
        "label": "12 oz"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA",
      "7FXXZX4VQNWFVRPSV6JRJWRK"
    ]
  },
  {
    "key": "filter",
    "name": "Filter",
    "section": "Filter",
    "ingredients": "Batch brew",
    "photo": null,
    "sizes": [
      {
        "id": "X4OTNWRBWUXGPM23OS3GCKP5",
        "label": "8 oz"
      },
      {
        "id": "F6JRBJXRDXIHNDOAQWOFEATF",
        "label": "12 oz"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "cold-brew",
    "name": "Cold Brew",
    "section": "Iced",
    "ingredients": "Slow-steeped, over ice",
    "photo": null,
    "sizes": [
      {
        "id": "HGXAOVXLZYBN5MMGG7CEMPFM",
        "label": "12 oz"
      },
      {
        "id": "UTEP57XA6PY63E7IDI4NRWKL",
        "label": "16 oz"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "americano-iced",
    "name": "Americano, iced",
    "section": "Iced",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "HNT6S44TELB4IVO4YUKJ4SSJ",
        "label": "12 oz"
      },
      {
        "id": "NBVH53MIDWNZTI27VJTJKFKR",
        "label": "16 oz"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "cortado-iced",
    "name": "Cortado, iced",
    "section": "Iced",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "AQ2L5X6TKGEVVIO2OFOPNYOF",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "cappuccino-iced",
    "name": "Cappuccino, iced",
    "section": "Iced",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "5QL4LDUA4L5G6AC6R5BVJYLC",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "flat-white-iced",
    "name": "Flat White, iced",
    "section": "Iced",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "6HMPIPASJM3LBKEKPLO4S62H",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "mocha-iced",
    "name": "Mocha, iced",
    "section": "Iced",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "J4E6HBG3IN3NK3M4MZ7QCP2M",
        "label": "12 oz"
      },
      {
        "id": "EXTL3SO2ZIGITOBSEWLDM2TX",
        "label": "16 oz"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "vanilla-latte-iced",
    "name": "Vanilla Latte, iced",
    "section": "Iced",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "IILV6PSLLZCNTVFKMLC4YBJG",
        "label": "12 oz"
      },
      {
        "id": "PPPHA2ZIUQU2ISHM6URYEXWJ",
        "label": "16 oz"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "chai-latte",
    "name": "Chai Latte",
    "section": "Tea & other",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "ZIP6YPQK36G2DRVZMRMXX2N3",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "dirty-chai",
    "name": "Dirty Chai",
    "section": "Tea & other",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "2CLSJ7ETUNN76DZDPRWWGKJ6",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "chai-iced",
    "name": "Chai, iced",
    "section": "Tea & other",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "QXELBH7QD66LEVXEW7PR5FKZ",
        "label": "12 oz"
      },
      {
        "id": "YN5G3LQFU7OHDASDFK6DUNNP",
        "label": "16 oz"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "dirty-chai-iced",
    "name": "Dirty Chai, iced",
    "section": "Tea & other",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "KDZ7HXYLBPNGXDU6DZUHZUQZ",
        "label": "12 oz"
      },
      {
        "id": "7HWWSKXESSTEHXRIJZMQQ4LZ",
        "label": "16 oz"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "matcha-latte",
    "name": "Matcha Latte",
    "section": "Tea & other",
    "ingredients": "Matcha, milk",
    "photo": null,
    "sizes": [
      {
        "id": "MREDA7GNIILQJ4BY2LZSMKS4",
        "label": "Regular"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA",
      "JHKNCQM4YSDQ5CQSXFXBQXWA"
    ]
  },
  {
    "key": "matcha-latte-iced",
    "name": "Matcha Latte, iced",
    "section": "Tea & other",
    "ingredients": "Matcha, milk, over ice",
    "photo": null,
    "sizes": [
      {
        "id": "5J4UM2QMWSKUJ62ESGSXCJDO",
        "label": "12 oz"
      },
      {
        "id": "AZ2GZR6PVANSWI6X2KWFJWTU",
        "label": "16 oz"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA",
      "JHKNCQM4YSDQ5CQSXFXBQXWA"
    ]
  },
  {
    "key": "matcha-americano",
    "name": "Matcha Americano",
    "section": "Tea & other",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "ARCPBWM4J2VBRN3D6VI3SCYO",
        "label": "Hot"
      },
      {
        "id": "BCU4OBU7LJSOW33K4THA6ELY",
        "label": "Iced"
      }
    ],
    "lists": []
  },
  {
    "key": "hojicha-latte",
    "name": "Hojicha Latte",
    "section": "Tea & other",
    "ingredients": "Roasted green tea, milk",
    "photo": null,
    "sizes": [
      {
        "id": "Y75WJTZUFIFITNLIW4N6POW3",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "hojicha-latte-iced",
    "name": "Hojicha Latte, iced",
    "section": "Tea & other",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "4NTCGC7YCK327QR3ZTSNHHV5",
        "label": "12 oz"
      },
      {
        "id": "D3YPIF6W2Y7BPZIJ3XDS6QA5",
        "label": "16 oz"
      }
    ],
    "lists": [
      "ID6PQ7M2DQLEE2A56C24OYCA",
      "JHKNCQM4YSDQ5CQSXFXBQXWA"
    ]
  },
  {
    "key": "hot-chocolate",
    "name": "Hot Chocolate",
    "section": "Tea & other",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "6BBACYF6NIWPNEGPE65EHD7M",
        "label": "Regular"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "chocolate-iced",
    "name": "Chocolate, iced",
    "section": "Tea & other",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "SALJ7VEHUDQX7SRF5NJYAR7J",
        "label": "12 oz"
      },
      {
        "id": "WQKTHI6PU36MOU5ALB7L72DW",
        "label": "16 oz"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA"
    ]
  },
  {
    "key": "tea",
    "name": "Tea",
    "section": "Tea & other",
    "ingredients": "",
    "photo": null,
    "sizes": [
      {
        "id": "D6QPCUING6ODNVQVYOLOLFIC",
        "label": "Hot"
      },
      {
        "id": "RC4GT7SKC3PAJYXZFCIZ5UQX",
        "label": "Iced"
      }
    ],
    "lists": [
      "JHKNCQM4YSDQ5CQSXFXBQXWA",
      "ID6PQ7M2DQLEE2A56C24OYCA",
      "P4YUG7J5COXAFFQ5TLRC7T6R"
    ]
  }
];

/* What the site shows, 23 Sep: the four photographed drinks and six more
   as a list. Frederik's call after the first mobile pass: the full list was
   too long on a phone. Ingredient lines for the six are drafts of 23 Sep,
   for Benjamin to confirm. Everything else above stays keyed and ready; to
   bring a drink back, add its key here. The five are staples standing in
   until Benjamin names the best sellers from Square's item sales report. */
export const LIVE = [
  'einspanner', 'yuzu-matcha-tonic', 'latte-iced', 'saffron-latte',
  'latte', 'cappuccino', 'flat-white', 'cortado', 'cold-brew', 'matcha-latte',
];
/* In LIVE's order: the list on the page reads in the order written here. */
export const MENU_LIVE = LIVE.map(k => MENU.find(m => m.key === k)).filter(Boolean);

export const byKey = Object.fromEntries(MENU.map(m => [m.key, m]));
export const variationIds = MENU_LIVE.flatMap(m => m.sizes.map(s => s.id));
export function variationOf(id) {
  for (const m of MENU) for (const s of m.sizes) if (s.id === id) return { item: m, size: s };
  return null;
}
