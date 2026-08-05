import { TEST_IDS } from '@/shared/config';
import { AppButton, ErrorState, LoadingState, PageShell, PermissionState } from '@/shared/ui';

import { resolveScheduleScreenState } from '../../helpers/schedule-screen-state.helper';
import { ScheduleDetailBody } from '../schedule-detail-body';
import type { PracticeScheduleDetailViewProps } from './practice-schedule-detail-view.types';

/**
 * The create/edit screen for one recurring pattern.
 *
 * The screen owns only which state to show; the loaded body is
 * `ScheduleDetailBody`. States are resolved once into a single value rather
 * than re-derived per branch, so "forbidden" and "loading" can never both
 * render.
 */
export function PracticeScheduleDetailView(
  props: PracticeScheduleDetailViewProps,
): React.JSX.Element {
  const state = resolveScheduleScreenState(props);
  return (
    <PageShell title={props.title} testId={TEST_IDS.practiceScheduleDetailPage}>
      <section aria-label={props.heading} className="flex flex-col gap-5">
        <AppButton
          label={props.backLabel}
          tone="ghost"
          testId={TEST_IDS.practiceScheduleBack}
          onClick={props.onBack}
        />

        {state === 'forbidden' ? (
          <PermissionState
            title={props.errorTitle}
            testId={TEST_IDS.practiceScheduleDetailForbidden}
          />
        ) : null}

        {state === 'loading' ? (
          <LoadingState
            label={props.loadingLabel}
            testId={TEST_IDS.practiceScheduleDetailLoading}
          />
        ) : null}

        {state === 'error' ? (
          <ErrorState
            title={props.errorTitle}
            message={props.errorMessage}
            testId={TEST_IDS.practiceScheduleDetailError}
          />
        ) : null}

        {state === 'ready' ? <ScheduleDetailBody {...props} /> : null}
      </section>
    </PageShell>
  );
}
