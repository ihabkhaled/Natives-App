import { IonNote, IonTextarea } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel, SelectField } from '@/shared/ui';

import type { TryoutEvaluationPanelProps } from './tryout-evaluation-panel.types';

/** Evaluator scoring. An unobserved criterion stays explicitly unscored. */
export function TryoutEvaluationPanel(props: TryoutEvaluationPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel
      heading={view.heading}
      intro={view.intro}
      notice={view.forbiddenNotice}
      testId={TEST_IDS.tryoutEvaluationPanel}
    >
      <div className="app-evaluation__grid">
        {view.rows.map((row) => (
          <SelectField
            key={row.criterion}
            testId={TEST_IDS.tryoutEvaluationScore}
            label={row.label}
            value={row.value}
            options={row.options}
            onChange={row.onChange}
          />
        ))}
      </div>
      <IonTextarea
        data-testid={TEST_IDS.tryoutEvaluationNote}
        label={view.noteLabel}
        labelPlacement="stacked"
        placeholder={view.notePlaceholder}
        value={view.noteValue}
        autoGrow
        onIonInput={(event) => {
          view.onNoteChange(event.detail.value ?? '');
        }}
      />
      {view.forbiddenNotice === null ? (
        <AppButton
          label={view.submitLabel}
          tone="primary"
          testId={TEST_IDS.tryoutEvaluationSubmit}
          loading={view.isSaving}
          onClick={view.onSubmit}
        />
      ) : (
        <IonNote color="warning">{view.forbiddenNotice}</IonNote>
      )}
    </SectionPanel>
  );
}
