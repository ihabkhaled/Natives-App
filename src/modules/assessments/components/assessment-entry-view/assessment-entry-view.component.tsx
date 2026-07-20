import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, AsyncStateView, PageShell } from '@/shared/ui';

import { AssessmentMetricGrid } from '../assessment-metric-grid';
import { AssessmentRevisionList } from '../assessment-revision-list';
import { AssessmentStatusChip } from '../assessment-status-chip';
import { AssessmentWorkflowBar } from '../assessment-workflow-bar';
import { ASSESSMENT_ENTRY_STATE_TEST_IDS } from './assessment-entry-view.constants';
import type { AssessmentEntryViewProps } from './assessment-entry-view.types';

/** Assessment entry: header, workflow bar, metric grid, summary, revisions. */
export function AssessmentEntryView(props: AssessmentEntryViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.assessmentEntryPage}>
      <section
        data-testid={TEST_IDS.assessmentEntryView}
        aria-label={props.title}
        className="app-assessment-entry flex flex-col gap-5"
      >
        <AppButton
          label={props.backLabel}
          tone="ghost"
          testId={TEST_IDS.assessmentEntryBack}
          onClick={props.onBack}
        />
        <AsyncStateView view={props} variant="detail" {...ASSESSMENT_ENTRY_STATE_TEST_IDS} />
        {props.status === 'ready' ? (
          <>
            <header className="app-assessment-entry__head">
              <div className="app-assessment-entry__identity">
                <IonText>
                  <h2 className="app-assessment-entry__player m-0">{props.playerLabel}</h2>
                </IonText>
                <IonNote>{props.revisionLabel}</IonNote>
              </div>
              <AssessmentStatusChip label={props.statusLabel} tone={props.statusTone} />
            </header>
            <AssessmentWorkflowBar
              workflowLabel={props.workflowLabel}
              completenessLabel={props.completenessLabel}
              completenessValue={props.completenessValue}
              completenessPercent={props.completenessPercent}
              readOnlyLabel={props.readOnlyLabel}
              isEditable={props.isEditable}
              saveLabel={props.saveLabel}
              isSaving={props.isSaving}
              isTransitioning={props.isTransitioning}
              actions={props.workflowActions}
              onSave={props.onSave}
              onWorkflowStep={props.onWorkflowStep}
            />
            <AssessmentMetricGrid
              groups={props.groups}
              gridLabel={props.gridLabel}
              isDisabled={!props.isEditable}
              noteLabel={props.noteLabel}
              notePlaceholder={props.notePlaceholder}
              notEvaluatedLabel={props.notEvaluatedLabel}
              notEvaluatedHint={props.notEvaluatedHint}
              clearLabel={props.clearLabel}
              onScoreChange={props.onScoreChange}
              onNumericChange={props.onNumericChange}
              onTextChange={props.onTextChange}
              onNoteChange={props.onNoteChange}
              onClearValue={props.onClearValue}
            />
            <AppInput
              testId={TEST_IDS.assessmentSummaryNote}
              label={props.summaryLabel}
              name="assessment-summary"
              value={props.summary}
              placeholder={props.summaryPlaceholder}
              disabled={!props.isEditable}
              onValueChange={props.onSummaryChange}
            />
            <AssessmentRevisionList
              title={props.revisionsLabel}
              emptyLabel={props.revisionsEmptyLabel}
              revisions={props.revisions}
            />
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
