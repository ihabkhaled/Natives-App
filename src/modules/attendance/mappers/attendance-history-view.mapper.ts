import { formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { ATTENDANCE_STATUS_LABEL_KEYS } from '../constants/attendance.constants';
import type { AttendanceRevisionView } from '../types/attendance-view.types';
import type { AttendanceRevision } from '../types/attendance.types';

type Translate = (key: string, params?: TranslateParams) => string;

export function mapAttendanceHistoryView(
  t: Translate,
  locale: string,
  history: readonly AttendanceRevision[],
): readonly AttendanceRevisionView[] {
  return history.map((revision) => ({
    id: revision.id,
    transitionLabel: t(I18N_KEYS.attendance.revisionChanged, {
      from:
        revision.fromStatus === null
          ? t(I18N_KEYS.attendance.statusUnmarked)
          : t(ATTENDANCE_STATUS_LABEL_KEYS[revision.fromStatus]),
      to: t(ATTENDANCE_STATUS_LABEL_KEYS[revision.toStatus]),
    }),
    occurredLabel: t(I18N_KEYS.attendance.correctedAt, {
      when: formatCairoDateTime(revision.occurredAtIso, locale),
    }),
    reason: revision.correctionReason,
  }));
}
