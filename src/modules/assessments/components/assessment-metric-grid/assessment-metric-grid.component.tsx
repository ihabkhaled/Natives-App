import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { AssessmentMetricField } from '../assessment-metric-field';
import type { AssessmentMetricGridProps } from './assessment-metric-grid.types';

/** The template metric grid, grouped by evaluation category. */
export function AssessmentMetricGrid(props: AssessmentMetricGridProps): React.JSX.Element {
  return (
    <div
      className="app-metric-grid"
      data-testid={TEST_IDS.assessmentMetricGrid}
      aria-label={props.gridLabel}
      role="group"
    >
      <IonNote className="app-metric-grid__hint">{props.notEvaluatedHint}</IonNote>
      {props.groups.map((group) => (
        <section key={group.categoryId} className="app-metric-group">
          <header className="app-metric-group__head">
            <IonText>
              <h3 className="app-eyebrow app-metric-group__title m-0">{group.name}</h3>
            </IonText>
            <IonNote>{group.description}</IonNote>
          </header>
          <div className="app-metric-group__fields">
            {group.fields.map((field) => (
              <AssessmentMetricField
                key={field.metricDefinitionId}
                field={field}
                isDisabled={props.isDisabled}
                noteLabel={props.noteLabel}
                notePlaceholder={props.notePlaceholder}
                notEvaluatedLabel={props.notEvaluatedLabel}
                clearLabel={props.clearLabel}
                onScoreChange={props.onScoreChange}
                onNumericChange={props.onNumericChange}
                onTextChange={props.onTextChange}
                onNoteChange={props.onNoteChange}
                onClearValue={props.onClearValue}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
