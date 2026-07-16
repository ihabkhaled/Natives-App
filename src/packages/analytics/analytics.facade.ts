import { createConsoleSink, createLogger, type AppLogger } from '@/packages/logger';

import { ANALYTICS_EVENTS } from './analytics.constants';

export type AnalyticsProperties = Record<string, string | number | boolean>;

let analyticsLogger: AppLogger = createLogger('analytics', createConsoleSink());

/**
 * Vendor-free analytics seam. Swap the sink for a real provider behind
 * this owner without touching feature code.
 */
export function trackEvent(name: string, properties?: AnalyticsProperties): void {
  analyticsLogger.debug(`event ${name}`, properties);
}

export function trackScreenView(screenName: string): void {
  trackEvent(ANALYTICS_EVENTS.screenView, { screen: screenName });
}

export function setAnalyticsLoggerForTesting(logger: AppLogger): void {
  analyticsLogger = logger;
}
