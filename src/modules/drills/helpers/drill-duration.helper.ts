import { DRILL_FIELD_LIMITS } from '../constants/drills.constants';

/** A blank field means "no default duration"; anything else must be a whole number. */
export function parseDurationInput(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) ? parsed : null;
}

/** Blank is valid (optional field); a typed value must fall inside the wire bounds. */
export function isValidDurationInput(value: string): boolean {
  const parsed = parseDurationInput(value);
  if (value.trim() === '') {
    return true;
  }
  return (
    parsed !== null &&
    parsed >= DRILL_FIELD_LIMITS.durationMin &&
    parsed <= DRILL_FIELD_LIMITS.durationMax
  );
}
