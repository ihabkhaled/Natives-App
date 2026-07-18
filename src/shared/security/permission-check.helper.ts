/**
 * Pure set membership over permission strings. UI convenience only: the
 * backend re-checks every protected operation regardless of what these say.
 */
export function hasAllPermissions(
  granted: readonly string[],
  required: readonly string[],
): boolean {
  const set = new Set(granted);
  return required.every((permission) => set.has(permission));
}
