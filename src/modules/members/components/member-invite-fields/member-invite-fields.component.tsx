import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, SelectField } from '@/shared/ui';

import type { MemberInviteFieldsProps } from './member-invite-fields.types';

/**
 * The invite form's fields: the account half (who to email, and at what access
 * level) above the roster half (how they appear in the directory). Both halves
 * are one submission because inviting a real person means both records exist.
 */
export function MemberInviteFields(props: MemberInviteFieldsProps): React.JSX.Element {
  const { invite } = props;
  return (
    <div
      data-testid={TEST_IDS.memberInviteForm}
      role="group"
      aria-label={invite.title}
      className="app-member-form flex flex-col gap-2"
    >
      <IonNote className="app-member-form__intro">{invite.intro}</IonNote>
      <AppInput
        testId={TEST_IDS.memberInviteEmail}
        label={invite.emailLabel}
        name="invite-email"
        type="email"
        value={invite.email}
        placeholder={invite.emailPlaceholder}
        onValueChange={invite.onEmailChange}
        errorMessage={invite.emailError ?? undefined}
      />
      <SelectField
        testId={TEST_IDS.memberInviteRole}
        label={invite.roleLabel}
        value={invite.role}
        options={invite.roleOptions}
        onChange={invite.onRoleChange}
        disabled={invite.roleSelectDisabled}
      />
      {invite.roleOptionsNotice === null ? null : (
        <IonNote
          data-testid={TEST_IDS.memberInviteRoleNotice}
          role="status"
          className="app-member-form__hint"
        >
          {invite.roleOptionsNotice}
        </IonNote>
      )}
      <IonNote className="app-member-form__hint">{invite.roleHint}</IonNote>

      <IonText>
        <h3 className="app-member-form__subhead">{invite.profileHeading}</h3>
      </IonText>
      <IonNote className="app-member-form__hint">{invite.profileIntro}</IonNote>
      <AppInput
        testId={TEST_IDS.memberInviteFullName}
        label={invite.fullNameLabel}
        name="invite-full-name"
        value={invite.fullName}
        placeholder={invite.fullNamePlaceholder}
        onValueChange={invite.onFullNameChange}
        errorMessage={invite.fullNameError ?? undefined}
      />
      <AppInput
        testId={TEST_IDS.memberInviteNickname}
        label={invite.nicknameLabel}
        name="invite-nickname"
        value={invite.nickname}
        onValueChange={invite.onNicknameChange}
      />
      <AppInput
        testId={TEST_IDS.memberInviteJersey}
        label={invite.jerseyLabel}
        name="invite-jersey"
        value={invite.jersey}
        onValueChange={invite.onJerseyChange}
      />
      {invite.errorMessage === null ? null : (
        <IonNote
          data-testid={TEST_IDS.memberInviteError}
          color="danger"
          role="alert"
          className="app-member-form__error"
        >
          {invite.errorMessage}
        </IonNote>
      )}
      <div className="app-member-form__actions flex gap-2">
        <AppButton
          testId={TEST_IDS.memberInviteCancel}
          label={invite.cancelLabel}
          tone="secondary"
          onClick={invite.onClose}
        />
        <AppButton
          testId={TEST_IDS.memberInviteSubmit}
          label={invite.isSubmitting ? invite.submittingLabel : invite.submitLabel}
          tone="primary"
          loading={invite.isSubmitting}
          onClick={invite.onSubmit}
        />
      </div>
    </div>
  );
}
