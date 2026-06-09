const SHOPIFY_DOMAIN = 'concierge-coffee-2245.myshopify.com';
const STOREFRONT_TOKEN = '72c7d161eb6090308178da3ee5c88887';
const API_URL = `https://${SHOPIFY_DOMAIN}/api/2026-04/graphql.json`;

async function shopifyFetch(query, variables = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const { data, errors } = await res.json();
  if (errors) console.error('Shopify errors:', errors);
  return data;
}

// Fetch all products
export async function getProducts() {
  const data = await shopifyFetch(`{
    products(first: 20) {
      edges {
        node {
          id
          title
          handle
          description
          tags
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 1) {
            edges { node { url altText } }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price { amount }
                availableForSale
              }
            }
          }
        }
      }
    }
  }`);
  return data?.products?.edges?.map(e => e.node) ?? [];
}

// Create a cart
export async function createCart(lines) {
  const data = await shopifyFetch(`
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          cost { totalAmount { amount currencyCode } }
          lines(first: 20) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product { title }
                    price { amount }
                  }
                }
              }
            }
          }
        }
      }
    }
  `, { input: { lines } });
  return data?.cartCreate?.cart;
}

// Add lines to existing cart
export async function addToCart(cartId, lines) {
  const data = await shopifyFetch(`
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          cost { totalAmount { amount currencyCode } }
          lines(first: 20) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product { title }
                    price { amount }
                  }
                }
              }
            }
          }
        }
      }
    }
  `, { cartId, lines });
  return data?.cartLinesAdd?.cart;
}
