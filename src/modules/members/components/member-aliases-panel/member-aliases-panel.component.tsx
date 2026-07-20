import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput } from '@/shared/ui';

import type { MemberAliasesPanelProps } from './member-aliases-panel.types';

/** Alias management: list of aliases plus an add control (manager-gated). */
export function MemberAliasesPanel(props: MemberAliasesPanelProps): React.JSX.Element | null {
  return props.canManage ? (
    <section
      data-testid={TEST_IDS.memberAliasesPanel}
      aria-label={props.heading}
      className="app-panel flex flex-col gap-3"
    >
      <IonText>
        <h2 className="app-panel__heading m-0">{props.heading}</h2>
      </IonText>
      {props.items.length === 0 ? (
        <IonNote>{props.emptyLabel}</IonNote>
      ) : (
        <ul className="app-alias-list flex flex-col gap-2">
          {props.items.map((alias) => (
            <li key={alias.id} data-testid={TEST_IDS.memberAliasItem} className="app-alias-item">
              <span className="app-alias-item__label">{alias.alias}</span>
              <AppButton
                testId={TEST_IDS.memberAliasRemove}
                label={alias.removeLabel}
                tone="secondary"
                disabled={props.isBusy}
                onClick={() => {
                  props.onRemove(alias.id);
                }}
              />
            </li>
          ))}
        </ul>
      )}
      <div className="app-alias-add flex gap-2">
        <AppInput
          testId={TEST_IDS.memberAliasInput}
          label={props.addLabel}
          name="alias-add"
          value={props.draft}
          placeholder={props.addPlaceholder}
          onValueChange={props.onDraftChange}
        />
        <AppButton
          testId={TEST_IDS.memberAliasAdd}
          label={props.addButtonLabel}
          tone="secondary"
          loading={props.isBusy}
          onClick={props.onAdd}
        />
      </div>
    </section>
  ) : null;
}
