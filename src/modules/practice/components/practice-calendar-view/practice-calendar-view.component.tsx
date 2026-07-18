import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { EmptyState, ErrorState, LoadingState, OfflineState, PermissionState } from '@/shared/ui';

import { CalendarSubscriptionNote } from '../calendar-subscription-note';
import { PracticeCalendarContent } from '../practice-calendar-content';
import { PracticeFilterBar } from '../practice-filter-bar';
import type { PracticeCalendarViewProps } from './practice-calendar-view.types';

/** Practice calendar body: filters, one presented state, and subscription help. */
export function PracticeCalendarView(props: PracticeCalendarViewProps): React.JSX.Element {
  return (
    <section
      data-testid={TEST_IDS.practiceCalendarView}
      aria-label={props.title}
      className="flex flex-col gap-4"
    >
      <IonText color="medium">
        <p className="m-0 text-sm">{props.subtitle}</p>
      </IonText>
      <PracticeFilterBar filter={props.filter} />
      {props.status === 'loading' ? (
        <LoadingState label={props.loadingLabel} testId={TEST_IDS.practiceCalendarLoading} />
      ) : null}
      {props.status === 'error' ? (
        <ErrorState
          title={props.errorTitle}
          message={props.errorMessage}
          retryLabel={props.retryLabel}
          onRetry={props.onRetry}
          testId={TEST_IDS.practiceCalendarError}
        />
      ) : null}
      {props.status === 'offline' ? (
        <OfflineState
          title={props.offlineTitle}
          message={props.offlineMessage}
          testId={TEST_IDS.practiceCalendarOffline}
        />
      ) : null}
      {props.status === 'forbidden' ? (
        <PermissionState
          title={props.forbiddenTitle}
          message={props.forbiddenMessage}
          testId={TEST_IDS.practiceCalendarForbidden}
        />
      ) : null}
      {props.status === 'empty' ? (
        <EmptyState
          title={props.emptyTitle}
          message={props.emptyMessage}
          testId={TEST_IDS.practiceCalendarEmpty}
        />
      ) : null}
      {props.status === 'ready' ? <PracticeCalendarContent {...props} /> : null}
      <CalendarSubscriptionNote
        heading={props.subscriptionHeading}
        body={props.subscriptionBody}
        testId={TEST_IDS.practiceSubscriptionNote}
      />
    </section>
  );
}
