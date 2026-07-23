import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, EmptyState, PageShell, SelectField } from '@/shared/ui';

import { BuddyCreditList } from '../buddy-credit-list';
import { TrainingComposer } from '../training-composer';
import { TrainingSubmissionList } from '../training-submission-list';
import { TRAINING_STATE_TEST_IDS } from './training-view.constants';
import type { TrainingViewProps } from './training-view.types';

/** External training workspace: composer on top, own claim history below. */
export function TrainingView(props: TrainingViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.trainingPage}>
      <section
        data-testid={TEST_IDS.trainingView}
        aria-label={props.title}
        className="app-training flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        {props.status === 'forbidden' ? null : <TrainingComposer view={props.composer} />}

        {props.status === 'forbidden' ? null : <BuddyCreditList view={props.buddies} />}

        <div className="app-training__filters">
          <SelectField
            testId={TEST_IDS.trainingStatusFilter}
            label={props.statusFilterLabel}
            value={props.statusFilter}
            options={props.statusOptions}
            onChange={props.onStatusFilterChange}
          />
        </div>

        <AsyncStateView view={props} variant="list" {...TRAINING_STATE_TEST_IDS} />

        {props.status === 'ready' && !props.hasMatches ? (
          <EmptyState title={props.noMatchesTitle} message={props.noMatchesMessage} />
        ) : null}

        {props.status === 'ready' && props.hasMatches ? (
          <>
            <IonNote>{props.countLabel}</IonNote>
            <TrainingSubmissionList items={props.items} onOpen={props.onOpen} />
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
