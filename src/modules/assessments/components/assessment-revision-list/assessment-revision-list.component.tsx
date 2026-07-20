import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { AssessmentStatusChip } from '../assessment-status-chip';
import type { AssessmentRevisionListProps } from './assessment-revision-list.types';

/** The revision family of one assessment, newest revision label per row. */
export function AssessmentRevisionList(props: AssessmentRevisionListProps): React.JSX.Element {
  return (
    <section
      className="app-surface-card app-assessment-revisions"
      data-testid={TEST_IDS.assessmentRevisionList}
      aria-label={props.title}
    >
      <IonText>
        <h3 className="app-eyebrow app-assessment-revisions__title m-0">{props.title}</h3>
      </IonText>
      {props.revisions.length === 0 ? <IonNote>{props.emptyLabel}</IonNote> : null}
      <ul className="app-assessment-revisions__list">
        {props.revisions.map((revision) => (
          <li key={revision.id} className="app-assessment-revisions__item">
            <span>{revision.label}</span>
            <AssessmentStatusChip label={revision.statusLabel} tone={revision.statusTone} />
          </li>
        ))}
      </ul>
    </section>
  );
}
