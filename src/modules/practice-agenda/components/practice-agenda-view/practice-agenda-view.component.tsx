import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell } from '@/shared/ui';

import { AgendaBlockList } from '../agenda-block-list';
import { PRACTICE_AGENDA_STATE_TEST_IDS } from './practice-agenda-view.constants';
import type { PracticeAgendaViewProps } from './practice-agenda-view.types';

/**
 * The coach's plan for one session: the blocks in the order they run, each
 * with the stations inside it.
 *
 * The notice is a live region so a refused move is announced rather than only
 * shown — a coach adjusting a session while it runs is rarely looking at the
 * screen when the answer arrives.
 */
export function PracticeAgendaView(props: PracticeAgendaViewProps): React.JSX.Element {
  return (
    <PageShell title={props.pageTitle} testId={TEST_IDS.practiceAgendaPage}>
      <section aria-label={props.pageTitle} className="app-practice-agenda flex flex-col gap-5">
        <header className="app-screen-intro">
          <h2 className="app-section-panel__title m-0">{props.listHeading}</h2>
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
            <p className="m-0 text-sm">{props.listIntro}</p>
          </IonText>
        </header>

        {props.notice === null ? null : (
          <p className="app-pending-notice m-0" role="status">
            {props.notice}
          </p>
        )}

        <AsyncStateView view={props} variant="list" {...PRACTICE_AGENDA_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            <IonText color="medium">
              <p className="m-0 text-sm">{props.countLabel}</p>
            </IonText>
            <AgendaBlockList
              blocks={props.blocks}
              ariaLabel={props.listHeading}
              moveUpLabel={props.moveUpLabel}
              moveDownLabel={props.moveDownLabel}
              removeStationLabel={props.removeStationLabel}
              canEdit={props.canEdit}
              isSaving={props.isSaving}
              onMoveBlock={props.onMoveBlock}
              onRemoveStation={props.onRemoveStation}
            />
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
