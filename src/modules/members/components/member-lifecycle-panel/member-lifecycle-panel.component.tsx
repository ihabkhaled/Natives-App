import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput } from '@/shared/ui';

import type { MemberLifecyclePanelProps } from './member-lifecycle-panel.types';

/** Lifecycle admin actions with a reason field and per-action confirm dialogs. */
export function MemberLifecyclePanel(props: MemberLifecyclePanelProps): React.JSX.Element | null {
  return props.canManage ? (
    <section
      data-testid={TEST_IDS.memberLifecyclePanel}
      aria-label={props.heading}
      className="app-panel flex flex-col gap-3"
    >
      <IonText>
        <h2 className="app-panel__heading m-0">{props.heading}</h2>
      </IonText>
      <AppInput
        testId={TEST_IDS.memberLifecycleReason}
        label={props.reasonLabel}
        name="lifecycle-reason"
        value={props.reason}
        placeholder={props.reasonPlaceholder}
        onValueChange={props.onReasonChange}
      />
      {props.actions.length === 0 ? (
        <IonNote>{props.noActionsLabel}</IonNote>
      ) : (
        <div className="app-panel__actions flex flex-wrap gap-2">
          {props.actions.map((action) => (
            <AppButton
              key={action.action}
              testId={TEST_IDS.memberLifecycleAction}
              label={action.label}
              tone={action.tone}
              disabled={props.isSubmitting}
              onClick={() => {
                props.onAction(action.action);
              }}
            />
          ))}
        </div>
      )}
    </section>
  ) : null;
}
