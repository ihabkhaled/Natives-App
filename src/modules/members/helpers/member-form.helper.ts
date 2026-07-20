/** Parse a free-text jersey field into a bounded number, or null when blank/invalid. */
export function parseJerseyInput(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
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
  readonly jerseyNumber: number | null;
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
