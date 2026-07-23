/**
 * Numeric form-field bridging: Ionic inputs speak strings, setting values
 * speak numbers, and an empty field means "not provided" — never zero.
 */
export function parseIntegerInput(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export function parseDecimalInput(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function numericInputValue(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

/**
 * A one-field integer patch: `{ threshold: 250 }` for a parsable entry and
 * an empty patch (keep the previous number) for anything else.
 */
export function integerFieldPatch<F extends string>(
  field: F,
  raw: string,
): Partial<Record<F, number>> {
  const parsed = parseIntegerInput(raw);
  if (parsed === undefined) {
    return {};
  }
  return { [field]: parsed } as Partial<Record<F, number>>;
}
