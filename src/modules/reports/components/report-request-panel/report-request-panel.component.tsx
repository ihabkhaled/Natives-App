import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SelectField, StatusChip } from '@/shared/ui';

import type { ReportRequestPanelProps } from './report-request-panel.types';

/**
 * The request panel: the governed template catalog as radio cards (label,
 * one-line purpose, privacy chip), a format choice preselecting the template
 * default, and an optional season scope. Restricted templates say so before
 * anything is generated.
 */
export function ReportRequestPanel(props: ReportRequestPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <form
      data-testid={TEST_IDS.reportRequestPanel}
      aria-label={view.heading}
      className="app-surface-card app-report-request"
      onSubmit={(event) => {
        event.preventDefault();
        view.onSubmit();
      }}
    >
      <IonText>
        <h2 className="app-report-request__title m-0">{view.heading}</h2>
      </IonText>
      <IonNote>{view.intro}</IonNote>
      <fieldset className="app-report-request__templates">
        <legend className="app-eyebrow">{view.templateLabel}</legend>
        {view.templates.map((template) => (
          <label
            key={template.template}
            className={
              template.isSelected
                ? 'app-template-card app-template-card--selected'
                : 'app-template-card'
            }
            data-testid={TEST_IDS.reportTemplateOption}
          >
            <input
              type="radio"
              name="report-template"
              className="sr-only"
              value={template.template}
              checked={template.isSelected}
              onChange={template.onSelect}
            />
            <span className="app-template-card__body">
              <span className="app-template-card__label">{template.label}</span>
              <IonNote>{template.hint}</IonNote>
              {template.restrictedHint === null ? null : (
                <IonNote color="warning">{template.restrictedHint}</IonNote>
              )}
            </span>
            <StatusChip label={template.privacyLabel} tone={template.privacyTone} />
          </label>
        ))}
      </fieldset>
      <SelectField
        testId={TEST_IDS.reportFormatSelect}
        label={view.formatLabel}
        value={view.formatValue}
        options={view.formatOptions}
        onChange={view.onFormatChange}
      />
      <SelectField
        testId={TEST_IDS.reportSeasonSelect}
        label={view.seasonLabel}
        value={view.seasonValue}
        options={view.seasonOptions}
        onChange={view.onSeasonChange}
      />
      {view.validationMessage === null ? null : (
        <IonNote color="danger" role="alert" data-testid={TEST_IDS.reportRequestError}>
          {view.validationMessage}
        </IonNote>
      )}
      <AppButton
        label={view.submitLabel}
        tone="primary"
        type="submit"
        testId={TEST_IDS.reportRequestSubmit}
        disabled={!view.canSubmit}
        loading={view.isSubmitting}
        expand={true}
      />
      {view.offlineReason === null ? null : <IonNote>{view.offlineReason}</IonNote>}
    </form>
  );
}
