export const REDACTED_PLACEHOLDER = '[REDACTED]';

const SENSITIVE_KEY_PATTERN = /token|secret|password|authorization|cookie|credential/i;

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

export function redactSensitiveEntries(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    output[key] = isSensitiveKey(key) ? REDACTED_PLACEHOLDER : value;
  }
  return output;
}
