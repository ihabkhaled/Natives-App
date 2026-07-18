import { Fragment } from 'react';

import { IonBadge, IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { CalendarSubscriptionNote } from '../calendar-subscription-note';
import { PracticeCounts } from '../practice-counts';
import { RsvpControl } from '../rsvp-control';
import { SessionAgenda } from '../session-agenda';
import { VenueInfo } from '../venue-info';
import type { PracticeSessionBodyProps } from './practice-session-body.types';

/** Presentational body of a practice session detail (composition only). */
export function PracticeSessionBody(props: PracticeSessionBodyProps): React.JSX.Element {
  const { detail } = props;
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <IonText>
          <h2 className={`m-0 text-lg font-semibold ${detail.isCancelled ? 'line-through' : ''}`}>
            {detail.title}
          </h2>
        </IonText>
        <div className="flex flex-wrap gap-2">
          <IonBadge color="medium">{detail.typeLabel}</IonBadge>
          <IonBadge color={detail.statusTone}>{detail.statusLabel}</IonBadge>
        </div>
      </header>
      {detail.changeHeading === null ? null : (
        <div
          role="alert"
          data-testid={TEST_IDS.practiceSessionChangeBanner}
          className="rounded-lg border border-[color:var(--ion-color-warning)] p-3"
        >
          <IonText>
            <p className="m-0 text-sm font-semibold">{detail.changeHeading}</p>
          </IonText>
          <IonNote>{detail.changeMessage}</IonNote>
        </div>
      )}
      {props.isOffline ? (
        <IonNote data-testid={TEST_IDS.practiceSessionOffline}>{props.offlineNoticeLabel}</IonNote>
      ) : null}
      <section aria-label={detail.scheduleHeading}>
        <IonText>
          <h2 className="m-0 mb-1 text-base font-semibold">{detail.scheduleHeading}</h2>
        </IonText>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {detail.scheduleRows.map((row) => (
            <Fragment key={row.key}>
              <dt className="font-medium">{row.label}</dt>
              <dd className="m-0 text-end">{row.value}</dd>
            </Fragment>
          ))}
        </dl>
        <IonNote className="mt-1 block">{detail.capacityLabel}</IonNote>
      </section>
      <VenueInfo
        heading={detail.venueHeading}
        venue={detail.venue}
        tbdLabel={detail.venueTbdLabel}
        onOpenMap={props.onOpenMap}
      />
      {detail.instructions === null ? null : (
        <section aria-label={detail.instructionsHeading}>
          <IonText>
            <h2 className="m-0 mb-1 text-base font-semibold">{detail.instructionsHeading}</h2>
            <p className="m-0 whitespace-pre-line text-sm">{detail.instructions}</p>
          </IonText>
        </section>
      )}
      <SessionAgenda
        heading={detail.agendaHeading}
        emptyLabel={detail.agendaEmptyLabel}
        items={detail.agenda}
      />
      <PracticeCounts
        heading={detail.countsHeading}
        counts={detail.counts}
        privateLabel={detail.countsPrivateLabel}
      />
      <RsvpControl
        data={detail.rsvp}
        selectedReason={props.selectedReason}
        isSubmitting={props.isSubmitting}
        conflictNote={props.conflictNote}
        onSelectReason={props.onSelectReason}
        onSubmit={props.onSubmitRsvp}
      />
      <IonNote className="block text-xs">{detail.updatedLabel}</IonNote>
      <CalendarSubscriptionNote
        heading={detail.subscriptionHeading}
        body={detail.subscriptionBody}
        testId={TEST_IDS.practiceSubscriptionNote}
      />
    </div>
  );
}
