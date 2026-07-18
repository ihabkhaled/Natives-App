/**
 * Static feature-flag registry. Route metadata references a flag so a screen
 * can ship dark; navigation and guards hide flagged-off routes entirely.
 * A later prompt can back this with remote configuration without changing
 * the route metadata contract.
 */
export const FEATURE_FLAGS = {
  adminConsole: 'admin-console',
} as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

/** Flags currently switched on for every persona. */
export const ENABLED_FEATURE_FLAGS: readonly FeatureFlag[] = [FEATURE_FLAGS.adminConsole];

/** A route with no flag is always enabled; a flagged route follows the registry. */
export function isFeatureEnabled(flag: FeatureFlag | null): boolean {
  return flag === null || ENABLED_FEATURE_FLAGS.includes(flag);
}
