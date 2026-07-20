import { formatDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  ASSESSMENT_STATUS,
  ASSESSMENT_STATUS_LABEL_KEYS,
  ASSESSMENT_STATUS_TONES,
} from '../constants/assessments.constants';
import type { AssessmentStatus } from '../constants/assessments.constants';
import type {
  AssessmentFilterOption,
  AssessmentsStatus,
  AssessmentSummaryView,
} from '../types/assessments-view.types';
import type { AssessmentCatalog, AssessmentSummary } from '../types/assessments.types';

type Translate = (key: string, params?: TranslateParams) => string;

export const ALL_STATUSES_FILTER = 'all';

function periodName(catalog: AssessmentCatalog | undefined, periodId: string): string {
  return catalog?.periods.find((period) => period.id === periodId)?.name ?? periodId;
}

/** The status filter options, always led by an explicit "all". */
export function buildStatusOptions(t: Translate): readonly AssessmentFilterOption[] {
  return [
    { value: ALL_STATUSES_FILTER, label: t(I18N_KEYS.assessments.filterAll) },
    ...Object.values(ASSESSMENT_STATUS).map((status) => ({
      value: status,
      label: t(ASSESSMENT_STATUS_LABEL_KEYS[status]),
    })),
  ];
}

export function filterByStatus(
  items: readonly AssessmentSummary[],
  statusFilter: string,
): readonly AssessmentSummary[] {
  return statusFilter === ALL_STATUSES_FILTER
    ? items
    : items.filter((item) => item.status === statusFilter);
}

export function buildSummaryView(
  t: Translate,
  locale: string,
  catalog: AssessmentCatalog | undefined,
  summary: AssessmentSummary,
): AssessmentSummaryView {
  return {
    id: summary.id,
    periodLabel: periodName(catalog, summary.periodId),
    playerLabel: summary.membershipId,
    statusLabel: t(ASSESSMENT_STATUS_LABEL_KEYS[summary.status]),
    statusTone: ASSESSMENT_STATUS_TONES[summary.status],
    revisionLabel: t(I18N_KEYS.assessments.revisionLabel, { revision: summary.revision }),
    timestampLabel:
      summary.publishedAtIso === null
        ? `${t(I18N_KEYS.assessments.updatedAtLabel)}: ${formatDateTime(
            summary.createdAtIso,
            locale,
          )}`
        : `${t(I18N_KEYS.assessments.publishedAtLabel)}: ${formatDateTime(
            summary.publishedAtIso,
            locale,
          )}`,
    openLabel: t(I18N_KEYS.assessments.openEntry),
  };
}

/**
 * Pure state machine deciding which single screen state to present. A missing
 * record is its own designed state rather than a generic failure.
 */
export function resolveAssessmentsStatus(params: {
  readonly isForbidden: boolean;
  readonly hasData: boolean;
  readonly hasItems: boolean;
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly isOffline: boolean;
  readonly isMissing?: boolean;
}): AssessmentsStatus {
  if (params.isForbidden) {
    return 'forbidden';
  }
  if (params.isMissing === true) {
    return 'empty';
  }
  if (params.hasData) {
    return params.hasItems ? 'ready' : 'empty';
  }
  if (params.isLoading) {
    return 'loading';
  }
  if (params.isOffline) {
    return 'offline';
  }
  return params.hasError ? 'error' : 'empty';
}

/** Chip tone for one status, exposed for the entry header. */
export function statusTone(status: AssessmentStatus): string {
  return ASSESSMENT_STATUS_TONES[status];
}

/** Translated chip label for one status. */
export function statusLabel(t: Translate, status: AssessmentStatus): string {
  return t(ASSESSMENT_STATUS_LABEL_KEYS[status]);
}
