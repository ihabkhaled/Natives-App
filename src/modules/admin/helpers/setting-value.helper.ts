/** A parsed setting value, or an explicit failure. Never a thrown error. */
export interface ParsedSettingValue {
  readonly ok: boolean;
  readonly value: unknown;
}

/**
 * Settings are opaque server-owned JSON. The form accepts text, parses it
 * here, and refuses to submit anything that is not valid JSON — the client
 * never guesses at a shape it does not own.
 */
export function parseSettingValue(raw: string): ParsedSettingValue {
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, value: null };
  }
}
