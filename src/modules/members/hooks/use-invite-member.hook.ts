import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppMutation, useQueryClient } from '@/packages/query';
import { copyTextToClipboard } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { resolveInvitationErrorKey } from '../helpers/invitation-error.helper';
import { buildInviteSentView } from '../helpers/invite-sent-view.helper';
import { buildInviteFormCopy } from '../helpers/invite-form-copy.helper';
import {
  isInviteFormValid,
  toInvitationRole,
  validateInviteForm,
} from '../helpers/invite-form.helper';
import {
  normalizeOptionalText,
  normalizeRequiredName,
  parseJerseyInput,
} from '../helpers/member-form.helper';
import { membersQueryKeys } from '../queries/members.keys';
import { invitePersonByEmail } from '../services/invite-member-by-email.service';
import type { InvitationDelivery } from '../types/members.types';
import type { InviteFormView } from '../types/members-view.types';
import { useInviteFormState } from './use-invite-form-state.hook';

/**
 * Inviting a real person: one flow, two records.
 *
 * The form collects the email and access level the identity layer needs and the
 * roster profile the directory needs, then reports what actually happened —
 * "emailed to X", plus the one-time accept link as the manual fallback for the
 * dev/console email adapter. Failures resolve to specific copy (duplicate,
 * malformed, expired) rather than a generic retry toast.
 */
export function useInviteMember(teamId: string, canInvite: boolean): InviteFormView {
  const { t, locale } = useAppTranslation();
  const { showToast } = useAppToast();
  const queryClient = useQueryClient();
  const form = useInviteFormState(locale);
  const [sent, setSent] = useState<InvitationDelivery | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const errors = validateInviteForm(form.email, form.fullName);
  const mutation = useAppMutation({
    mutationFn: () =>
      invitePersonByEmail(teamId, {
        email: form.email.trim(),
        role: toInvitationRole(form.role),
        profile: {
          fullName: normalizeRequiredName(form.fullName) ?? '',
          nickname: normalizeOptionalText(form.nickname),
          jerseyNumber: parseJerseyInput(form.jersey),
        },
      }),
    onSuccess: (delivery: InvitationDelivery) => {
      void queryClient.invalidateQueries({ queryKey: membersQueryKeys.team(teamId) });
      setErrorKey(null);
      setSent(delivery);
    },
    onError: (error: unknown) => {
      setErrorKey(resolveInvitationErrorKey(error));
    },
  });
  return {
    ...buildInviteFormCopy(t),
    canInvite,
    isOpen: form.isOpen,
    onOpen: form.open,
    onClose: () => {
      form.close();
      setSent(null);
      setErrorKey(null);
    },
    email: form.email,
    onEmailChange: form.setEmail,
    emailError: form.isSubmitted && errors.email !== null ? t(errors.email) : null,
    role: form.role,
    onRoleChange: form.setRole,
    fullName: form.fullName,
    onFullNameChange: form.setFullName,
    fullNameError: form.isSubmitted && errors.fullName !== null ? t(errors.fullName) : null,
    nickname: form.nickname,
    onNicknameChange: form.setNickname,
    jersey: form.jersey,
    onJerseyChange: form.setJersey,
    isSubmitting: mutation.isPending,
    errorMessage: errorKey === null ? null : t(errorKey),
    sent:
      sent === null
        ? null
        : buildInviteSentView(t, sent, {
            formatExpiry: form.formatExpiry,
            onCopy: () => {
              void copyTextToClipboard(sent.acceptUrl).then((copied) =>
                showToast({
                  message: t(
                    copied
                      ? I18N_KEYS.members.inviteLinkCopiedToast
                      : I18N_KEYS.members.inviteLinkCopyFailedToast,
                  ),
                  tone: copied ? 'success' : 'danger',
                }),
              );
            },
            onDone: () => {
              form.reset();
              setSent(null);
            },
          }),
    onSubmit: () => {
      form.markSubmitted();
      setErrorKey(null);
      if (isInviteFormValid(errors)) {
        mutation.mutate(undefined);
      }
    },
  };
}
