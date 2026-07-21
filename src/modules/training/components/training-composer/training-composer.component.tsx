import { IonNote, IonText, IonTextarea } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppDateField, AppInput, SelectField } from '@/shared/ui';

import { TrainingBuddyEditor } from '../training-buddy-editor';
import { TrainingEvidenceEditor } from '../training-evidence-editor';
import { PERFORMED_ON_DATETIME_ID } from './training-composer.constants';
import type { TrainingComposerProps } from './training-composer.types';

/**
 * The submission composer. The candidate-points readout is deliberately
 * honest: an unapproved activity type shows "pending" rather than a guessed
 * number, and the notice below states that the server awards the points.
 */
export function TrainingComposer(props: TrainingComposerProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      data-testid={TEST_IDS.trainingComposer}
      aria-label={view.heading}
      className="app-surface-card app-training-composer"
    >
      <header className="app-training-composer__head">
        <IonText>
          <h2 className="app-training-composer__title m-0">{view.heading}</h2>
        </IonText>
        <IonNote>{view.intro}</IonNote>
      </header>

      <div className="app-training-composer__grid">
        <SelectField
          testId={TEST_IDS.trainingTypeSelect}
          label={view.typeLabel}
          placeholder={view.typePlaceholder}
          value={view.typeValue}
          options={view.typeOptions}
          onChange={view.onTypeChange}
        />

        <AppDateField
          label={view.dateLabel}
          datetimeId={PERFORMED_ON_DATETIME_ID}
          value={view.dateValue}
          onValueChange={view.onDateChange}
          max={view.dateMax}
          locale={view.dateLocale}
          testId={TEST_IDS.trainingDateField}
          inputTestId={TEST_IDS.trainingDateInput}
        />

        <AppInput
          label={view.durationLabel}
          name="training-duration"
          type="number"
          value={view.durationValue}
          onValueChange={view.onDurationChange}
          testId={TEST_IDS.trainingDurationInput}
        />

        {view.showsQuantity ? (
          <AppInput
            label={view.quantityLabel}
            name="training-quantity"
            type="number"
            value={view.quantityValue}
            onValueChange={view.onQuantityChange}
            testId={TEST_IDS.trainingQuantityInput}
          />
        ) : null}
      </div>

      {view.durationHint === null ? null : (
        <IonNote className="app-training-composer__hint">{view.durationHint}</IonNote>
      )}

      <IonTextarea
        data-testid={TEST_IDS.trainingNotesInput}
        label={view.notesLabel}
        labelPlacement="stacked"
        placeholder={view.notesPlaceholder}
        autoGrow
        rows={3}
        value={view.notesValue}
        onIonInput={(event) => {
          view.onNotesChange(event.detail.value ?? '');
        }}
      />

      <div
        data-testid={TEST_IDS.trainingCandidatePoints}
        className={
          view.hasCandidate
            ? 'app-training-candidate'
            : 'app-training-candidate app-training-candidate--pending'
        }
      >
        <span className="app-eyebrow">{view.candidateHeading}</span>
        <strong className="app-training-candidate__value">{view.candidateLabel}</strong>
        <IonNote>{view.hasCandidate ? view.candidateNotice : view.candidateHint}</IonNote>
      </div>

      <TrainingEvidenceEditor view={view.evidence} />
      <TrainingBuddyEditor view={view.buddies} />

      {view.validationMessage === null ? null : (
        <IonNote color="warning" role="status">
          {view.validationMessage}
        </IonNote>
      )}

      <AppButton
        label={view.saveLabel}
        tone="primary"
        disabled={!view.canSave}
        loading={view.isSaving}
        onClick={view.onSave}
        testId={TEST_IDS.trainingSaveDraft}
      />
    </section>
  );
}
