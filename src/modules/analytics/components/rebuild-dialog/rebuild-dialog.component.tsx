import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SelectField } from '@/shared/ui';

import type { RebuildDialogProps } from './rebuild-dialog.types';

/**
 * The rebuild confirmation, defaults mirroring `RebuildAnalyticsDto`
 * (monthly). Rebuilds are idempotent server-side; the success surface then
 * cites the run's own report.
 */
export function RebuildDialog(props: RebuildDialogProps): React.JSX.Element {
  const { view } = props;
  return (
    <div
      data-testid={TEST_IDS.analyticsRebuildDialog}
      role="group"
      aria-label={view.heading}
      className="app-surface-card app-standings-dialog"
    >
      <IonText>
        <h3 className="app-standings-dialog__title m-0">{view.heading}</h3>
      </IonText>
      <IonNote>{view.intro}</IonNote>
      <SelectField
        label={view.periodLabel}
        value={view.periodValue}
        options={view.periodOptions}
        onChange={view.onPeriodChange}
      />
      <div className="app-standings-dialog__actions">
        <AppButton
          label={view.confirmLabel}
          tone="primary"
          testId={TEST_IDS.analyticsRebuildConfirm}
          disabled={!view.canConfirm}
          loading={view.isRunning}
          onClick={view.onConfirm}
        />
        <AppButton
          label={view.cancelLabel}
          tone="ghost"
          testId={TEST_IDS.analyticsRebuildCancel}
          onClick={view.onCancel}
        />
      </div>
    </div>
  );
}
