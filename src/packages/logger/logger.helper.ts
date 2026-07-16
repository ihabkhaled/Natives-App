import type { LogFields } from './logger.types';

const SENSITIVE_FIELD_PATTERN = /token|secret|password|authorization|cookie|credential/i;
const REDACTED = '[REDACTED]';

export function sanitizeLogFields(fields: LogFields): LogFields {
  const sanitized: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    sanitized[key] = SENSITIVE_FIELD_PATTERN.test(key) ? REDACTED : value;
  }
  return sanitized;
}

export function formatLogMessage(scope: string, message: string): string {
  return `[${scope}] ${message}`;
}
