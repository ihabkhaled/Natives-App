const SENSITIVE_HEADER_PATTERN = /^(?:authorization|cookie|set-cookie|x-api-key)$/i;
const REDACTED = '[REDACTED]';

export function sanitizeHeadersForLog(
  headers: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(headers)) {
    sanitized[key] = SENSITIVE_HEADER_PATTERN.test(key) ? REDACTED : value;
  }
  return sanitized;
}
