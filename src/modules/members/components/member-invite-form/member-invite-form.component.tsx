import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput } from '@/shared/ui';

import type { MemberInviteFormProps } from './member-invite-form.types';

/** Invite trigger plus an inline, validated create form (permission-gated). */
export function MemberInviteForm(props: MemberInviteFormProps): React.JSX.Element | null {
  const { invite } = props;
  return invite.canInvite ? (
    <div className="app-member-invite flex flex-col gap-3">
      <AppButton
        testId={TEST_IDS.membersInviteButton}
        label={invite.openLabel}
        tone="primary"
        onClick={invite.onOpen}
      />
      {invite.isOpen ? (
        <div
          data-testid={TEST_IDS.memberInviteForm}
          role="group"
          aria-label={invite.title}
          className="app-member-form flex flex-col gap-2"
        >
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
      ) : null}
    </div>
  ) : null;
}
