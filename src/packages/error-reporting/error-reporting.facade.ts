import * as SentryCapacitor from '@sentry/capacitor';
import * as SentryReact from '@sentry/react';

export interface ErrorReportingOptions {
  readonly dsn: string | undefined;
  readonly environment: string;
}

let reportingActive = false;

/**
 * Sentry owner. Reporting stays fully disabled unless a DSN is provided,
 * and reporting failures must never break the application.
 */
export function initErrorReporting(options: ErrorReportingOptions): void {
  if (options.dsn === undefined || options.dsn === '') {
    reportingActive = false;
    return;
  }
  SentryCapacitor.init(
    {
      dsn: options.dsn,
      environment: options.environment,
      sendDefaultPii: false,
    },
    SentryReact.init,
  );
  reportingActive = true;
}

export function isErrorReportingActive(): boolean {
  return reportingActive;
}

export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (!reportingActive) {
    return;
  }
  try {
    SentryCapacitor.captureException(error, context === undefined ? undefined : { extra: context });
  } catch {
    // Reporting must never crash the app; intentionally ignored.
  }
}

export function setReportingUser(userId: string | null): void {
  if (!reportingActive) {
    return;
  }
  SentryReact.setUser(userId === null ? null : { id: userId });
}

export function resetErrorReportingForTesting(): void {
  reportingActive = false;
}
