import { IonNote, IonSelect, IonSelectOption, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { EmptyState, PageShell } from '@/shared/ui';

import { AssessmentSummaryList } from '../assessment-summary-list';
import { AssessmentsStateView } from '../assessments-state-view';
import {
  ASSESSMENTS_LIST_HEIGHT_PX,
  ASSESSMENTS_STATE_TEST_IDS,
} from './assessments-view.constants';
import type { AssessmentsViewProps } from './assessments-view.types';

/** Assessment workspace: filter bar, one presented state, and the list. */
export function AssessmentsView(props: AssessmentsViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.assessmentsPage}>
      <section
        data-testid={TEST_IDS.assessmentsView}
        aria-label={props.title}
        className="app-assessments flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>
        <div className="app-assessments__filters">
          <IonSelect
            data-testid={TEST_IDS.assessmentsStatusFilter}
            label={props.statusFilterLabel}
            value={props.statusFilter}
            onIonChange={(event) => {
              props.onStatusFilterChange(event.detail.value as string);
            }}
          >
            {props.statusOptions.map((option) => (
              <IonSelectOption key={option.value} value={option.value}>
                {option.label}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>
        <AssessmentsStateView view={props} variant="list" {...ASSESSMENTS_STATE_TEST_IDS} />
        {props.status === 'ready' && !props.hasMatches ? (
          <EmptyState title={props.noMatchesTitle} message={props.noMatchesMessage} />
        ) : null}
        {props.status === 'ready' && props.hasMatches ? (
          <>
            <IonNote>{props.countLabel}</IonNote>
            <AssessmentSummaryList
              items={props.items}
              heightPx={ASSESSMENTS_LIST_HEIGHT_PX}
              emptyTitle={props.noMatchesTitle}
              onOpen={props.onOpen}
            />
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
