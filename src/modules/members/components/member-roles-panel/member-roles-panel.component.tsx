import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { MemberRolesPanelProps } from './member-roles-panel.types';

/** Privilege-ceiling-aware role assignment: toggles plus a save action. */
export function MemberRolesPanel(props: MemberRolesPanelProps): React.JSX.Element | null {
  return props.canManage ? (
    <section
      data-testid={TEST_IDS.memberRolesPanel}
      aria-label={props.heading}
      className="app-panel flex flex-col gap-3"
    >
      <IonText>
        <h2 className="app-panel__heading m-0">{props.heading}</h2>
      </IonText>
      <IonText color="medium">
        <p className="m-0 text-sm">{props.description}</p>
      </IonText>
      {props.ceilingNotice === null ? null : <IonNote>{props.ceilingNotice}</IonNote>}
      <div className="app-role-toggles flex flex-wrap gap-2">
        {props.roles.map((role) => (
          <button
            key={role.role}
            type="button"
            data-testid={TEST_IDS.memberRoleToggle}
            className="app-role-toggle"
            aria-pressed={role.checked}
            disabled={role.disabled}
            onClick={() => {
              props.onToggle(role.role);
            }}
          >
            {role.label}
          </button>
        ))}
      </div>
      <AppButton
        label={props.isSaving ? props.savingLabel : props.saveLabel}
        tone="primary"
        disabled={!props.isDirty}
        loading={props.isSaving}
        onClick={props.onSave}
      />
    </section>
  ) : null;
}
