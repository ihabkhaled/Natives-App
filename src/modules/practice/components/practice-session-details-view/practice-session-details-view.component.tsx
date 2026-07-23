import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import {
  AppButton,
  ErrorState,
  LoadingState,
  OfflineState,
  PageShell,
  PermissionState,
} from '@/shared/ui';

import { PracticeSessionBody } from '../practice-session-body';
import type { PracticeSessionDetailsViewProps } from './practice-session-details-view.types';

/** Session-detail body: one presented state, or the full detail when ready. */
export function PracticeSessionDetailsView(
  props: PracticeSessionDetailsViewProps,
): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.practiceSessionPage}>
      <main
        data-testid={TEST_IDS.practiceSessionDetails}
        className="app-practice-details flex flex-col gap-4"
      >
        {props.status === 'loading' ? (
          <LoadingState
            label={props.loadingLabel}
            testId={TEST_IDS.practiceSessionLoading}
            variant="detail"
          />
        ) : null}
        {props.status === 'error' ? (
          <ErrorState
            title={props.errorTitle}
            message={props.errorMessage}
            retryLabel={props.retryLabel}
            onRetry={props.onRetry}
            testId={TEST_IDS.practiceSessionError}
          />
        ) : null}
        {props.status === 'offline' ? (
          <OfflineState
            title={props.offlineTitle}
            message={props.offlineMessage}
            testId={TEST_IDS.practiceSessionOffline}
          />
        ) : null}
        {props.status === 'forbidden' ? (
          <PermissionState
            title={props.forbiddenTitle}
            message={props.forbiddenMessage}
            testId={TEST_IDS.practiceCalendarForbidden}
          />
        ) : null}
        {/* Only permitted staff with a resolved detail carry a CTA at all. */}
        {props.attendanceCta !== null ? (
          <section
            aria-label={props.attendanceCta.heading}
            className="app-surface-card flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <IonText>
              <h2 className="m-0 text-base font-semibold">{props.attendanceCta.heading}</h2>
            </IonText>
            <AppButton
              label={props.attendanceCta.label}
              tone="secondary"
              testId={TEST_IDS.practiceSessionAttendanceCta}
              onClick={props.attendanceCta.onOpen}
            />
          </section>
        ) : null}
        {props.status === 'ready' && props.detail !== null ? (
          <PracticeSessionBody
            detail={props.detail}
            isOffline={props.isOffline}
            offlineNoticeLabel={props.offlineNoticeLabel}
            selectedReason={props.selectedReason}
            isSubmitting={props.isSubmitting}
            conflictNote={props.conflictNote}
            onSelectReason={props.onSelectReason}
            onSubmitRsvp={props.onSubmitRsvp}
            onOpenMap={props.onOpenMap}
          />
        ) : null}
      </main>
    </PageShell>
  );
}
