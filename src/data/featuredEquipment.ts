/**
 * Static featured equipment data - extracted from database to avoid cloud queries.
 * To update: query equipment table (featured=true) and replace.
 * Last updated: 2026-02-20
 */

export const STATIC_FEATURED_EQUIPMENT = [
  {
    id: "246b220b-4013-4f2a-8134-264c85f7be5b",
    name: "Evoke 1200 b",
    brand: null,
    model: null,
    description: null,
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1769294018876_nanlux_evoke_1200b_led_bi_color_1726270.jpg",
    price_per_day: 170000,
    featured: true,
    featured_copy: null,
    order_index: 0,
  },
  {
    id: "af10fb1a-1012-4afa-969d-cae3471a84fe",
    name: "ARRI Alexa Mini",
    brand: "ARRI",
    model: "Mini",
    description: 'VIEW FINDER + CABLE // CAGE TILTA + TOP HANDLE + BATTERY PLATE VMOUNT // BASEPLATE TILTA 15MM // BASEPLATE TILTA 19MM + COLISA // ANTENA\n(TOTAL RODS: 2x CORTOS 15mm + 2x MEDIANOS 15mm + 2x MEDIANOS 19mm)"',
    image_url: null,
    price_per_day: 91000,
    featured: true,
    featured_copy: null,
    order_index: 0,
  },
];
