/**
 * The origin this build is being served from, e.g. `https://app.example.com`.
 *
 * Used to turn a server-issued relative path into a link a human can paste
 * somewhere else. Reading `location` is a runtime capability, so it lives here
 * rather than in a feature module.
 */
export function getApplicationOrigin(): string {
  return globalThis.location.origin;
}
