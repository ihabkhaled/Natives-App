import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput } from '@/shared/ui';

import type { AgendaGroupRowProps } from './agenda-group-row.types';

/**
 * One group: its own fields, its members with a remove control each, the
 * form that adds another, and the control that drops the group entirely.
 *
 * Every removal here is confirmed one hook up, in `use-agenda-groups-actions`
 * — this component only renders the button and forwards the click.
 */
export function AgendaGroupRow(props: AgendaGroupRowProps): React.JSX.Element {
  return (
    <li
      className="app-section-panel flex flex-col gap-2"
      data-testid={TEST_IDS.practiceAgendaGroupsGroupRow}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {props.color === null ? null : (
            // A coach-chosen colour, not an Ionic token — this is the one
            // place raw colour data reaches the DOM, and only as a decorative
            // swatch. The name carries the meaning; `aria-hidden` keeps the
            // swatch from being announced as unlabelled content.
            <span
              aria-hidden="true"
              data-testid={TEST_IDS.practiceAgendaGroupsGroupSwatch}
              className="h-4 w-4 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: props.color }}
            />
          )}
          <h3 className="m-0 text-sm font-semibold">{props.name}</h3>
        </div>
        <AppButton
          label={props.removeGroupLabel}
          tone="danger"
          loading={props.isRemovingGroup}
          testId={TEST_IDS.practiceAgendaGroupsGroupRemove}
          onClick={props.onRemoveGroup}
        />
      </div>

      {props.notes === null ? null : (
        <IonText color="medium">
          <p className="m-0 text-sm">{props.notes}</p>
        </IonText>
      )}

      {props.members.length === 0 ? (
        <IonText color="medium">
          <p className="m-0 text-sm">{props.membersEmptyLabel}</p>
        </IonText>
      ) : (
        <ul
          className="m-0 flex flex-col gap-1 p-0"
          data-testid={TEST_IDS.practiceAgendaGroupsGroupMembers}
        >
          {props.members.map((member) => (
            <li
              key={member.membershipId}
              className="flex items-center justify-between gap-2 text-sm"
              data-testid={TEST_IDS.practiceAgendaGroupsMemberItem}
            >
              <span>{member.membershipId}</span>
              <AppButton
                label={member.removeLabel}
                tone="ghost"
                loading={member.isRemoving}
                testId={TEST_IDS.practiceAgendaGroupsMemberRemove}
                onClick={member.onRemove}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <AppInput
          label={props.addMemberLabel}
          name={`add-member-${props.id}`}
          value={props.addMemberValue}
          placeholder={props.addMemberPlaceholder}
          testId={TEST_IDS.practiceAgendaGroupsAddMemberInput}
          onValueChange={props.onAddMemberValueChange}
        />
        <AppButton
          label={props.addMemberSubmitLabel}
          tone="secondary"
          disabled={!props.canAddMember}
          loading={props.isAddingMember}
          testId={TEST_IDS.practiceAgendaGroupsAddMemberSubmit}
          onClick={props.onAddMember}
        />
      </div>
    </li>
  );
}
