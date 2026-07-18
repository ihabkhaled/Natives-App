import { TEST_IDS } from '@/shared/config';
import { ErrorState, LoadingState, OfflineState, PermissionState } from '@/shared/ui';

import { PracticeSessionBody } from '../practice-session-body';
import type { PracticeSessionDetailsViewProps } from './practice-session-details-view.types';

/** Session-detail body: one presented state, or the full detail when ready. */
export function PracticeSessionDetailsView(
  props: PracticeSessionDetailsViewProps,
): React.JSX.Element {
  const detail = props.detail;
  return (
    <div data-testid={TEST_IDS.practiceSessionDetails} className="flex flex-col gap-4">
      {props.status === 'loading' ? (
        <LoadingState label={props.loadingLabel} testId={TEST_IDS.practiceSessionLoading} />
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
      {props.status === 'ready' && detail !== null ? (
        <PracticeSessionBody
          detail={detail}
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
    </div>
  );
}
