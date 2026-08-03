/**
 * Non-translatable external links for the landing page's location section.
 * Declaration home (rule 08/20) — kept separate from the translated address
 * copy, which lives in the i18n catalog.
 *
 * These point at the pitch itself (ملعب العربي, El Sheikh Zayed), not the
 * district: a visitor following a district-level pin arrives in the right
 * suburb and still cannot find the game.
 */
export const TEAM_LOCATION_MAPS_URL = 'https://maps.app.goo.gl/77HEdLvay1qBQtHL6';

/**
 * Google's embed URL for the same place.
 *
 * Deliberately the `maps/embed` endpoint rather than the Maps JavaScript API:
 * it needs no API key, ships no third-party script into the bundle, and cannot
 * read anything from the page. The iframe is sandboxed and lazy-loaded, so it
 * costs nothing until a visitor scrolls to it.
 */
export const TEAM_LOCATION_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2857.5627922730587!2d31.0079988!3d30.0553065!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14585b003e874a33%3A0x24f97bd5e0ebcd18!2z2YXZhNi52Kgg2KfZhNi52LHYqNmK!5e1!3m2!1sen!2seg!4v1785776755067!5m2!1sen!2seg';
