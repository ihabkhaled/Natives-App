/**
 * Pseudo-locale stress harness.
 *
 * Neither `en` nor `ar` is the worst case for a layout: German compounds and
 * long Arabic honorifics both run wider than the English copy a screen was
 * designed against. A pseudo-locale expands every string by a fixed factor and
 * marks its boundaries, so a clipped label, a truncated button, or a wrapped
 * table header shows up before a translator ever files it.
 *
 * Placeholders are copied through untouched: expanding `{{count}}` would break
 * interpolation and hide the very defect the harness exists to surface.
 */

/** Latin letters swapped for accented look-alikes: still readable, visibly not English. */
const ACCENT_MAP: Readonly<Record<string, string>> = {
  a: 'á',
  c: 'ç',
  e: 'é',
  i: 'í',
  n: 'ñ',
  o: 'ö',
  s: 'š',
  u: 'ü',
  A: 'Á',
  E: 'É',
  I: 'Í',
  O: 'Ö',
  U: 'Ü',
};

/** The padding a 1.6x expansion needs; European translations routinely hit it. */
const EXPANSION_RATIO = 0.6;
const PADDING_CHARACTER = '·';
const OPENING_MARKER = '⟦';
const CLOSING_MARKER = '⟧';
const PLACEHOLDER_PATTERN = /(\{\{\s*\w+\s*\}\})/u;
const ACCENTABLE = /[aceinosuAEIOU]/gu;

export interface PseudoLocaleEntry {
  readonly path: string;
  readonly source: string;
  readonly pseudo: string;
}

function accentSegment(segment: string): string {
  return segment.replaceAll(ACCENTABLE, (character) => ACCENT_MAP[character] ?? character);
}

/** Accent the prose, leave every `{{placeholder}}` byte-identical. */
function accentCopy(value: string): string {
  return value
    .split(PLACEHOLDER_PATTERN)
    .map((segment) => (PLACEHOLDER_PATTERN.test(segment) ? segment : accentSegment(segment)))
    .join('');
}

/** Expand a single string: markers, accents, and enough padding to stress the layout. */
export function toPseudoCopy(value: string): string {
  const padding = PADDING_CHARACTER.repeat(Math.max(1, Math.ceil(value.length * EXPANSION_RATIO)));
  return `${OPENING_MARKER}${accentCopy(value)}${padding}${CLOSING_MARKER}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Rebuild a catalog with the same tree shape and every leaf pseudo-localized. */
export function buildPseudoCatalog(catalog: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(catalog).map(([key, value]) => [
      key,
      isRecord(value) ? buildPseudoCatalog(value) : toPseudoCopy(String(value)),
    ]),
  );
}

/** Flatten a catalog into the widest strings first — the ones most likely to clip. */
export function rankByStress(
  catalog: Record<string, unknown>,
  prefix = '',
): readonly PseudoLocaleEntry[] {
  const entries = Object.entries(catalog).flatMap<PseudoLocaleEntry>(([key, value]) => {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (isRecord(value)) {
      return [...rankByStress(value, path)];
    }
    const source = String(value);
    return [{ path, source, pseudo: toPseudoCopy(source) }];
  });
  return [...entries].sort((left, right) => right.pseudo.length - left.pseudo.length);
}
