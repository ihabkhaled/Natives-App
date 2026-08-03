import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { ANOMALY_SEVERITIES } from '../constants/data-quality.constants';
import type {
  AnomaliesPage,
  Anomaly,
  AnomalySeverity,
  AnomalyStatus,
} from '../types/data-quality.types';
import type { AnomalyCardView } from '../types/data-quality-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

const KEYS = I18N_KEYS.dataQuality;

const SEVERITY_LABEL_KEYS: Readonly<Record<AnomalySeverity, string>> = {
  critical: KEYS.severityCritical,
  high: KEYS.severityHigh,
  medium: KEYS.severityMedium,
  low: KEYS.severityLow,
};

const STATUS_LABEL_KEYS: Readonly<Record<AnomalyStatus, string>> = {
  open: KEYS.statusOpen,
  acknowledged: KEYS.statusAcknowledged,
  resolved: KEYS.statusResolved,
  suppressed: KEYS.statusSuppressed,
};

/** Worst first. Ties break on the most recently seen, so a recurring problem rises. */
function bySeverityThenRecency(left: Anomaly, right: Anomaly): number {
  const rank =
    ANOMALY_SEVERITIES.indexOf(left.severity) - ANOMALY_SEVERITIES.indexOf(right.severity);
  return rank === 0 ? right.lastSeenAt.localeCompare(left.lastSeenAt) : rank;
}

/**
 * The anomaly queue as cards.
 *
 * A resolved or suppressed anomaly offers reopen and nothing else: repairing
 * something an operator has already closed would undo their decision without
 * telling them.
 */
export function buildAnomalyCardViews(
  t: Translate,
  anomalies: readonly Anomaly[],
): readonly AnomalyCardView[] {
  return [...anomalies].sort(bySeverityThenRecency).map((anomaly) => {
    const isClosed = anomaly.status === 'resolved' || anomaly.status === 'suppressed';
    return {
      id: anomaly.anomalyId,
      ruleKey: anomaly.ruleKey,
      severity: anomaly.severity,
      severityLabel: t(SEVERITY_LABEL_KEYS[anomaly.severity]),
      statusLabel: t(STATUS_LABEL_KEYS[anomaly.status]),
      resourceLabel: t(KEYS.resourceLabel),
      resourceRef: `${anomaly.resourceType} · ${anomaly.resourceRef}`,
      occurrencesLabel: t(KEYS.occurrencesLabel, { count: anomaly.occurrenceCount }),
      lastSeenLabel: t(KEYS.lastSeenLabel),
      lastSeenAt: anomaly.lastSeenAt,
      recordVersion: anomaly.recordVersion,
      canRepair: !isClosed,
      transitions: isClosed
        ? [{ key: 'reopen' as const, label: t(KEYS.reopenLabel) }]
        : [
            { key: 'acknowledge' as const, label: t(KEYS.acknowledgeLabel) },
            { key: 'resolve' as const, label: t(KEYS.resolveLabel) },
            { key: 'suppress' as const, label: t(KEYS.suppressLabel) },
          ],
    };
  });
}

/** The page's items and total, defaulted once so the screen reads neither twice. */
export function resolveAnomaliesPage(page: AnomaliesPage | undefined): {
  readonly items: readonly Anomaly[];
  readonly total: number;
  readonly hasData: boolean;
} {
  return {
    items: page?.items ?? [],
    total: page?.total ?? 0,
    hasData: page !== undefined,
  };
}
