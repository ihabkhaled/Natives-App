import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

export interface AttendanceNoticesView {
  readonly saved: (count: number) => void;
  readonly queued: (count: number) => void;
  readonly failed: () => void;
  readonly finalized: () => void;
  readonly corrected: () => void;
}

export function useAttendanceNotices(): AttendanceNoticesView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  return {
    saved: (count) => {
      void toast.showToast({
        message: t(I18N_KEYS.attendance.savedToast, { count }),
        tone: 'success',
      });
    },
    queued: (count) => {
      void toast.showToast({
        message: t(I18N_KEYS.attendance.queuedToast, { count }),
        tone: 'warning',
      });
    },
    failed: () => {
      void toast.showToast({
        message: t(I18N_KEYS.attendance.failedToast),
        tone: 'danger',
      });
    },
    finalized: () => {
      void toast.showToast({
        message: t(I18N_KEYS.attendance.finalizedToast),
        tone: 'success',
      });
    },
    corrected: () => {
      void toast.showToast({
        message: t(I18N_KEYS.attendance.correctedToast),
        tone: 'success',
      });
    },
  };
}
