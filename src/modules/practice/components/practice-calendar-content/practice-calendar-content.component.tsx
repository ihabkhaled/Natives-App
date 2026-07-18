import { IonButton, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { PracticeDaySection } from '../practice-day-section';
import type { PracticeCalendarContentProps } from './practice-calendar-content.types';

/** The ready-state calendar body: offline banner, day sections, pagination. */
export function PracticeCalendarContent(props: PracticeCalendarContentProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {props.isOffline ? <IonNote>{props.offlineNoticeLabel}</IonNote> : null}
      {props.sections.map((section) => (
        <PracticeDaySection
          key={section.dayKey}
          section={section}
          onSelectSession={props.onSelectSession}
        />
      ))}
      {props.boundedNotice === null ? null : <IonNote>{props.boundedNotice}</IonNote>}
      {props.hasMore ? (
        <IonButton
          fill="clear"
          expand="block"
          data-testid={TEST_IDS.practiceLoadMoreButton}
          disabled={props.isFetchingMore}
          aria-busy={props.isFetchingMore}
          onClick={props.onLoadMore}
        >
          {props.loadMoreLabel}
        </IonButton>
      ) : null}
    </div>
  );
}
