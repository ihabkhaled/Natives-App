import { IonBadge, IonText } from '@/packages/ionic';

import { MemberAliasesPanel } from '../member-aliases-panel';
import { MemberAvatar } from '../member-avatar';
import { MemberHistoryPanel } from '../member-history-panel';
import { MemberLifecyclePanel } from '../member-lifecycle-panel';
import { MemberProfileFields } from '../member-profile-fields';
import { MemberRolesPanel } from '../member-roles-panel';
import { MemberSelfEditForm } from '../member-self-edit-form';
import type { MemberProfileBodyProps } from './member-profile-body.types';

/** The ready profile: identity header, fields, and the audience-gated panels. */
export function MemberProfileBody(props: MemberProfileBodyProps): React.JSX.Element {
  return (
    <div className="app-profile-body flex flex-col gap-5">
      {props.header === null ? null : (
        <header className="app-profile-header">
          <MemberAvatar avatar={props.header.avatar} />
          <div className="app-profile-header__identity flex flex-col items-center gap-1">
            <IonText>
              <h1 className="app-profile-header__name m-0">{props.header.name}</h1>
            </IonText>
            {props.header.nickname === null ? null : (
              <IonText color="medium">
                <p className="m-0 text-sm">{props.header.nickname}</p>
              </IonText>
            )}
            <IonBadge color={props.header.statusTone}>{props.header.statusLabel}</IonBadge>
          </div>
        </header>
      )}
      <MemberProfileFields
        heading={props.fieldsHeading}
        restrictedNotice={props.restrictedNotice}
        fields={props.fields}
      />
      <MemberSelfEditForm selfEdit={props.selfEdit} />
      <MemberLifecyclePanel {...props.lifecycle} />
      <MemberRolesPanel {...props.roles} />
      <MemberAliasesPanel {...props.aliases} />
      <MemberHistoryPanel {...props.history} />
    </div>
  );
}
