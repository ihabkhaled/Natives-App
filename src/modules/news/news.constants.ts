/**
 * TODO(news-endpoints, contract 1.8.0): flip once the backend newsroom API is
 * deployed and `npm run contract:sync` has published it. Every screen reads
 * this flag to decide between its honest "not connected yet" notice and the
 * ordinary empty state; nothing else in the module branches on it, so the
 * switch is this constant plus the five service bodies in `services/`.
 */
export const NEWS_ENDPOINTS_ENABLED = false;

/**
 * What a newsroom data source reports back. `Unavailable` is the honest
 * pre-1.8.0 answer: no network call was made, so there is neither data nor a
 * failure to show — the screens render a "coming soon" notice rather than a
 * fabricated success or a spurious error.
 */
export const NEWS_SOURCE_STATUS = {
  Ready: 'ready',
  Unavailable: 'unavailable',
} as const;

/** Publication state of a story, mirroring the backend `status` enum. */
export const NEWS_STATUS = {
  Draft: 'draft',
  Published: 'published',
} as const;

/** One bounded page of public stories; the backend caps the page size too. */
export const NEWS_PAGE_SIZE = 12;

/** The only page the screens read today; pagination controls land with 1.8.0. */
export const NEWS_FIRST_PAGE = 1;

/** Longest excerpt rendered on a card before it is ellipsized. */
export const NEWS_EXCERPT_MAX_LENGTH = 180;

/** Field bounds, mirrored from the backend create/update DTO spec. */
export const NEWS_FIELD_LIMITS = {
  titleMin: 3,
  titleMax: 160,
  bodyMin: 20,
  bodyMax: 20_000,
  coverImageMax: 2048,
  linkIdMax: 64,
} as const;
