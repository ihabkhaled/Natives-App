import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, SelectField } from '@/shared/ui';

import { TrainingPanelHeading } from '../training-panel-heading';
import type { TrainingEvidenceEditorProps } from './training-evidence-editor.types';

/**
 * Evidence metadata editor. Only a reference and a description are collected —
 * raw bytes never enter web storage, which is exactly what the privacy note
 * under the field tells the member.
 */
export function TrainingEvidenceEditor(props: TrainingEvidenceEditorProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      data-testid={TEST_IDS.trainingEvidencePanel}
      aria-label={view.heading}
      className="app-training-panel"
    >
      <TrainingPanelHeading heading={view.heading} intro={view.intro} />
      <div className="app-training-evidence__form">
        <SelectField
          testId={TEST_IDS.trainingEvidenceKind}
          label={view.kindLabel}
          value={view.kindValue}
          options={view.kindOptions}
          onChange={view.onKindChange}
        />
        <AppInput
          label={view.referenceLabel}
          name="evidence-reference"
          value={view.referenceValue}
          onValueChange={view.onReferenceChange}
          testId={TEST_IDS.trainingEvidenceReference}
        />
        <AppInput
          label={view.descriptionLabel}
          name="evidence-description"
          value={view.descriptionValue}
          onValueChange={view.onDescriptionChange}
          testId={TEST_IDS.trainingEvidenceDescription}
        />
        <AppButton
          label={view.addLabel}
          tone="secondary"
          disabled={!view.canAdd}
          onClick={view.onAdd}
          testId={TEST_IDS.trainingEvidenceAdd}
        />
      </div>
      <IonNote className="app-training-panel__note">{view.privacyNotice}</IonNote>
      {view.items.length === 0 ? (
        <IonNote>{view.emptyLabel}</IonNote>
      ) : (
        <ul className="app-training-chiplist">
          {view.items.map((item) => (
            <li key={item.key} data-testid={TEST_IDS.trainingEvidenceItem}>
              <span className="app-training-chiplist__kind">{item.kindLabel}</span>
              <span className="app-training-chiplist__value">{item.reference}</span>
              {item.description === null ? null : (
                <IonNote className="app-training-chiplist__note">{item.description}</IonNote>
              )}
              <AppButton
                label={view.removeLabel}
                tone="ghost"
                onClick={() => {
                  view.onRemove(item.key);
                }}
                testId={TEST_IDS.trainingEvidenceRemove}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
