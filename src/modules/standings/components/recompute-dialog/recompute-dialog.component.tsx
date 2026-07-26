import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SelectField } from '@/shared/ui';

import type { RecomputeDialogProps } from './recompute-dialog.types';

/**
 * The recompute confirmation: competition pre-filled by the screen scope, a
 * rule family chosen from the active versions, and an explicit confirm — the
 * result banner then explains exactly what was derived.
 */
export function RecomputeDialog(props: RecomputeDialogProps): React.JSX.Element {
  const { view } = props;
  return (
    <div
      data-testid={TEST_IDS.standingsRecomputeDialog}
      role="group"
      aria-label={view.heading}
      className="app-surface-card app-standings-dialog"
    >
      <IonText>
        <h3 className="app-standings-dialog__title m-0">{view.heading}</h3>
      </IonText>
      <IonNote>{view.intro}</IonNote>
      <SelectField
        testId={TEST_IDS.standingsRecomputeRule}
        label={view.ruleLabel}
        value={view.ruleValue}
        options={view.ruleOptions}
        onChange={view.onRuleChange}
      />
      <div className="app-standings-dialog__actions">
        <AppButton
          label={view.confirmLabel}
          tone="primary"
          testId={TEST_IDS.standingsRecomputeConfirm}
          disabled={!view.canConfirm}
          loading={view.isRunning}
          onClick={view.onConfirm}
        />
        <AppButton
          label={view.cancelLabel}
          tone="ghost"
          testId={TEST_IDS.standingsRecomputeCancel}
          onClick={view.onCancel}
        />
      </div>
    </div>
  );
}
