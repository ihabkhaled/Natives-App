import { IonNote, IonText } from '@/packages/ionic';

import { SetPasswordFields } from '../set-password-fields';
import { ACCEPT_INVITATION_VIEW_TEST_IDS } from './accept-invitation-view.constants';
import type { AcceptInvitationViewProps } from './accept-invitation-view.types';

/** Valid-invitation body: who invited you, your email, and the password form. */
export function AcceptInvitationView(props: AcceptInvitationViewProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <IonText>
        <p className="m-0 text-sm">{props.introMessage}</p>
      </IonText>
      <div className="flex flex-col gap-1">
        <IonNote>{props.emailLabel}</IonNote>
        <IonText>
          <span data-testid={ACCEPT_INVITATION_VIEW_TEST_IDS.email}>{props.invitationEmail}</span>
        </IonText>
      </div>
      <SetPasswordFields
        labels={props.fieldsLabels}
        form={props.form}
        displayNameField={props.displayNameField}
        isSubmitting={props.isSubmitting}
        submitErrorMessage={props.submitErrorMessage}
      />
    </div>
  );
}
