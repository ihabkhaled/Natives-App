/**
 * Joins the parts of a scope label (team, then season). A middle dot carries
 * no letters, so it needs no translation and reads the same in Arabic.
 */
export const SCOPE_SEPARATOR = ' · ';

/**
 * How the wire spells the same role in its two shapes.
 *
 * `GET /rbac/teams/{id}/assignable-roles` returns lower-case slugs (`coach`),
 * while `POST /rbac/assignments` takes the upper-case `roleKey` (`COACH`).
 * That asymmetry is the backend's, not ours, so the conversion lives in one
 * named place instead of being sprinkled through the grant path. It is a pure
 * case fold — never a lookup against a client-side list of known roles, which
 * would silently drop a role the server has just started offering.
 */
export const ROLE_KEY_CASE = {
  /** Catalog slug → the `roleKey` the assign endpoint expects. */
  toWire: (slug: string): string => slug.toUpperCase(),
  /** `roleKey` → the slug the shared role-label catalog is keyed by. */
  toSlug: (roleKey: string): string => roleKey.toLowerCase(),
} as const;
