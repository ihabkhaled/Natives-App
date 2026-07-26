import { IonNote, IonText, IonTextarea } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { AchievementImportWizardProps } from './achievement-import-wizard.types';

/**
 * The audited historical import, mirroring the backend's dry-run-first
 * contract: paste CSV → client validation → dry-run outcome table → explicit
 * commit. Never a raw JSON editor.
 */
export function AchievementImportWizard(props: AchievementImportWizardProps): React.JSX.Element {
  const { view } = props;
  return (
    <div
      className="app-surface-card app-standings-dialog"
      role="group"
      aria-label={view.heading}
      data-testid={TEST_IDS.achievementImportWizard}
    >
      <IonText>
        <h3 className="app-standings-dialog__title m-0">{view.heading}</h3>
      </IonText>
      <IonNote>{view.intro}</IonNote>

      {view.step === 'input' ? (
        <>
          <IonTextarea
            data-testid={TEST_IDS.achievementImportInput}
            label={view.inputLabel}
            labelPlacement="stacked"
            autoGrow={true}
            rows={6}
            value={view.inputValue}
            placeholder={view.inputHint}
            onIonInput={(event) => {
              view.onInputChange(event.detail.value ?? '');
            }}
          />
          {view.parseError === null ? null : (
            <IonNote color="danger" role="alert" data-testid={TEST_IDS.achievementImportParse}>
              {view.parseError}
            </IonNote>
          )}
          <AppButton
            label={view.parseLabel}
            tone="primary"
            testId={TEST_IDS.achievementImportDryRun}
            disabled={!view.canParse}
            loading={view.isRunning}
            onClick={view.onParse}
          />
        </>
      ) : (
        <>
          {view.previewHeading === null ? null : (
            <p className="app-eyebrow m-0">{view.previewHeading}</p>
          )}
          <div className="app-standings__scroll">
            <table className="app-standings-table" data-testid={TEST_IDS.achievementImportOutcomes}>
              <caption className="sr-only">{view.heading}</caption>
              <tbody>
                {view.outcomeRows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.reference}</th>
                    <td>
                      <StatusChip label={row.outcome.label} tone={row.outcome.tone} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {view.totals === null ? null : (
            <IonNote data-testid={TEST_IDS.achievementImportReport}>{view.totals}</IonNote>
          )}
          {view.step === 'preview' ? (
            <AppButton
              label={view.commitLabel}
              tone="primary"
              testId={TEST_IDS.achievementImportCommit}
              disabled={!view.canCommit}
              loading={view.isRunning}
              onClick={view.onCommit}
            />
          ) : null}
        </>
      )}
      <AppButton label={view.backLabel} tone="ghost" onClick={view.onBack} />
    </div>
  );
}
