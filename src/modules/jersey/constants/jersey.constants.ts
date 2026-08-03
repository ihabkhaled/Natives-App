/**
 * How many orders one page holds. Matches the API's own default window so a
 * page the client asks for is a page the server was built to serve.
 */
export const JERSEY_ORDER_PAGE_SIZE = 20;

/**
 * The apparel-order lifecycle, in the order the backend advances it. Listed
 * in sequence rather than alphabetically so the tone table below reads as a
 * progression and a new state cannot be slipped into the middle unnoticed.
 */
export const JERSEY_ORDER_STATUSES = [
  'draft',
  'submitted',
  'approved',
  'ordered',
  'received',
  'issued',
  'completed',
  'cancelled',
] as const;

/** Whether the team has settled up for an order. */
export const JERSEY_PAYMENT_STATUSES = ['unset', 'pending', 'partial', 'paid', 'waived'] as const;

/** Which kit a product belongs to. */
export const JERSEY_KIT_TYPES = ['home', 'away', 'alternate', 'training'] as const;

/** Garment sizes, smallest first — the order a size run is always read in. */
export const JERSEY_SIZES = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'] as const;

export const JERSEY_SLEEVES = ['short', 'long', 'sleeveless'] as const;

export const JERSEY_DIVISIONS = ['open', 'women', 'mixed'] as const;

/** A product is either orderable or retired; there is no in-between. */
export const JERSEY_PRODUCT_STATUSES = ['active', 'archived'] as const;
