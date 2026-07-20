import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, ReasonField } from '@/shared/ui';

import type { SquadOverrideDialogProps } from './squad-override-dialog.types';

/**
 * The coach override. Selecting a player the policy flagged is allowed, but
 * only with a written reason, which is stored with the selection.
 */
export function SquadOverrideDialog(props: SquadOverrideDialogProps): React.JSX.Element {
  const { view } = props;
  return (
    <div
      data-testid={TEST_IDS.squadOverridePanel}
      role="group"
      aria-label={view.heading}
      className="app-override-panel"
    >
      <IonText>
        <h3 className="app-override-panel__title m-0">{`${view.heading} — ${view.candidateName}`}</h3>
      </IonText>
      <IonNote>{view.intro}</IonNote>
      <ReasonField
        testId={TEST_IDS.squadOverrideReason}
        label={view.reasonLabel}
        placeholder={view.reasonPlaceholder}
        value={view.reasonValue}
        validationMessage={view.validationMessage}
        onChange={view.onReasonChange}
      />
      <div className="app-override-panel__actions">
        <AppButton
          label={view.confirmLabel}
          tone="primary"
          testId={TEST_IDS.squadOverrideConfirm}
          disabled={!view.canConfirm}
          loading={view.isSaving}
          onClick={view.onConfirm}
        />
        <AppButton
          label={view.cancelLabel}
          tone="ghost"
          testId={TEST_IDS.squadOverrideCancel}
          onClick={view.onCancel}
        />
      </div>
    </div>
  );
}
