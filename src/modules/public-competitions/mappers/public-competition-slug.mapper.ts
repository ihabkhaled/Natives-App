/**
 * The URL segment a competition is reachable at. The API has no slug column,
 * so the public name is slugified: anything that is not a letter or digit
 * collapses to a single hyphen, so "EUNC 2026" addresses `/results/eunc-2026`
 * and stays stable as long as the name does.
 */
export function toCompetitionSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, '-')
    .replaceAll(/^-+|-+$/gu, '');
}
