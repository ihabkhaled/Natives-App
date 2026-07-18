/**
 * Derives up to two uppercase initials from a display name. A single word uses
 * its first two letters; multiple words use the first letter of the first and
 * last word. Blank input yields an empty string so the caller can fall back to
 * an icon. Pure and locale-agnostic — no name data is logged or stored.
 */
export function deriveInitials(name: string): string {
  const [first, ...rest] = name
    .trim()
    .split(/\s+/u)
    .filter((word) => word.length > 0);
  if (first === undefined) {
    return '';
  }
  const last = rest.at(-1);
  if (last === undefined) {
    return first.slice(0, 2).toUpperCase();
  }
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}
