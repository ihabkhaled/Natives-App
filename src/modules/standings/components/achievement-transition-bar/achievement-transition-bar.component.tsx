import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, ReasonField } from '@/shared/ui';

import type { AchievementTransitionBarProps } from './achievement-transition-bar.types';

/**
 * The approval actions for the claim's current state — a display-only mirror
 * of the backend state machine. Approve/reject/archive arm a confirm step;
 * reject additionally collects the terminal reason the backend persists as
 * `rejectionReason`.
 */
export function AchievementTransitionBar(props: AchievementTransitionBarProps): React.JSX.Element {
  const { view } = props;
  return (
    <div className="app-transition-bar" data-testid={TEST_IDS.achievementTransitionBar}>
      {view.conflictNotice === null ? null : (
        <IonNote color="warning" role="alert" data-testid={TEST_IDS.achievementConflictNotice}>
          {view.conflictNotice}
        </IonNote>
      )}
      <div className="app-transition-bar__actions">
        {view.actions.map((action) => (
          <AppButton
            key={action.key}
            label={action.label}
            tone={action.tone}
            testId={`${TEST_IDS.achievementTransitionAction}-${action.key}`}
            onClick={action.onTrigger}
          />
        ))}
      </div>
      {view.confirm === null ? null : (
        <div className="app-transition-bar__confirm" role="group" aria-label={view.confirm.message}>
          <p className="m-0">{view.confirm.message}</p>
          {view.confirm.reasonLabel === null ? null : (
            <ReasonField
              testId={TEST_IDS.achievementTransitionReason}
              label={view.confirm.reasonLabel}
              placeholder={view.confirm.reasonHint ?? ''}
              value={view.confirm.reasonValue}
              validationMessage={null}
              onChange={view.confirm.onReasonChange}
            />
          )}
          <div className="app-transition-bar__actions">
            <AppButton
              label={view.confirm.confirmLabel}
              tone="primary"
              testId={TEST_IDS.achievementTransitionConfirm}
              loading={view.confirm.isRunning}
              onClick={view.confirm.onConfirm}
            />
            <AppButton
              label={view.confirm.cancelLabel}
              tone="ghost"
              testId={TEST_IDS.achievementTransitionCancel}
              onClick={view.confirm.onCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
