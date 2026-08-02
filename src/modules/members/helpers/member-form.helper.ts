const JERSEY_INPUT_PATTERN = /^[0-9]{1,4}$/;

/** Parse a free-text jersey field into a bounded number, or null when blank/invalid. */
/**
 * A shirt number is a printed label, so the typed value is kept verbatim
 * rather than parsed to an integer — parseInt would silently turn "011" into
 * 11. Anything that is not one to four digits is rejected as absent, matching
 * the server's ^[0-9]{1,4}$ check.
 */
export function parseJerseyInput(value: string): string | null {
  const trimmed = value.trim();
  return JERSEY_INPUT_PATTERN.test(trimmed) ? trimmed : null;
}

/** A full name is required; returns the trimmed value or null when blank. */
export function normalizeRequiredName(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** A nickname is optional; returns the trimmed value or null when blank. */
export function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export interface SelfEditInitialValues {
  readonly fullName: string;
  readonly nickname: string;
  readonly jersey: string;
}

interface SelfEditSource {
  readonly fullName: string | null;
  readonly displayName: string;
  readonly nickname: string | null;
  readonly jerseyNumber: string | null;
}

/** Seed the self-edit form from the loaded profile (blank when absent). */
export function buildSelfEditInitialValues(
  source: SelfEditSource | undefined,
): SelfEditInitialValues {
  if (source === undefined) {
    return { fullName: '', nickname: '', jersey: '' };
  }
  return {
    fullName: source.fullName ?? source.displayName,
    nickname: source.nickname ?? '',
    jersey: source.jerseyNumber === null ? '' : String(source.jerseyNumber),
  };
}
