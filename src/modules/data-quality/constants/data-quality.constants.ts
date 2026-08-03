/**
 * How many anomalies one page of the queue holds. An operator triages the
 * worst first, so the page is deliberately small rather than a full history.
 */
export const ANOMALY_PAGE_SIZE = 25;

/** Severities, ordered worst first — the order the queue presents them in. */
export const ANOMALY_SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;

/** Lifecycle states an anomaly moves through. */
export const ANOMALY_STATUSES = ['open', 'acknowledged', 'resolved', 'suppressed'] as const;

/** Transitions the queue offers, mapped to the status each one produces. */
export const ANOMALY_TRANSITIONS = ['acknowledge', 'resolve', 'suppress', 'reopen'] as const;
