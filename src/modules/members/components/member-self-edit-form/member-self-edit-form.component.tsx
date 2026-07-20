import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput } from '@/shared/ui';

import type { MemberSelfEditFormProps } from './member-self-edit-form.types';

/** Self profile edit: a trigger plus an inline, validated edit form. */
export function MemberSelfEditForm(props: MemberSelfEditFormProps): React.JSX.Element | null {
  const { selfEdit } = props;
  return selfEdit.canEdit ? (
    <div className="app-member-self-edit flex flex-col gap-3">
      <AppButton
        testId={TEST_IDS.memberSelfEditOpen}
        label={selfEdit.openLabel}
        tone="secondary"
        onClick={selfEdit.onOpen}
      />
      {selfEdit.isOpen ? (
        <div
          data-testid={TEST_IDS.memberSelfEditForm}
          role="group"
          aria-label={selfEdit.title}
          className="app-member-form flex flex-col gap-2"
        >
          <AppInput
            testId={TEST_IDS.memberSelfEditFullName}
            label={selfEdit.fullNameLabel}
            name="self-full-name"
            value={selfEdit.fullName}
            onValueChange={selfEdit.onFullNameChange}
            errorMessage={selfEdit.fullNameError ?? undefined}
          />
          <AppInput
            testId={TEST_IDS.memberSelfEditNickname}
            label={selfEdit.nicknameLabel}
            name="self-nickname"
            value={selfEdit.nickname}
            onValueChange={selfEdit.onNicknameChange}
          />
          <AppInput
            testId={TEST_IDS.memberSelfEditJersey}
            label={selfEdit.jerseyLabel}
            name="self-jersey"
            value={selfEdit.jersey}
            onValueChange={selfEdit.onJerseyChange}
          />
          <div className="app-member-form__actions flex gap-2">
            <AppButton
              testId={TEST_IDS.memberSelfEditCancel}
              label={selfEdit.cancelLabel}
              tone="secondary"
              onClick={selfEdit.onClose}
            />
            <AppButton
              testId={TEST_IDS.memberSelfEditSubmit}
              label={selfEdit.isSubmitting ? selfEdit.submittingLabel : selfEdit.submitLabel}
              tone="primary"
              loading={selfEdit.isSubmitting}
              onClick={selfEdit.onSubmit}
            />
          </div>
        </div>
      ) : null}
    </div>
  ) : null;
}
