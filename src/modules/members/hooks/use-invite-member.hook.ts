import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppMutation, useQueryClient } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import {
  normalizeOptionalText,
  normalizeRequiredName,
  parseJerseyInput,
} from '../helpers/member-form.helper';
import { membersQueryKeys } from '../queries/members.keys';
import { inviteMember } from '../services/invite-member.service';
import type { InviteFormView } from '../types/members-view.types';

/** Invite-a-member form state + optimistic-free create mutation with toasts. */
export function useInviteMember(teamId: string, canInvite: boolean): InviteFormView {
  const { t } = useAppTranslation();
  const { showToast } = useAppToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [jersey, setJersey] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const nameError = normalizeRequiredName(fullName);
  const mutation = useAppMutation({
    mutationFn: (validName: string) =>
      inviteMember(teamId, {
        fullName: validName,
        nickname: normalizeOptionalText(nickname),
        jerseyNumber: parseJerseyInput(jersey),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: membersQueryKeys.team(teamId) });
      void showToast({ message: t(I18N_KEYS.members.inviteSuccessToast), tone: 'success' });
      setIsOpen(false);
      setFullName('');
      setNickname('');
      setJersey('');
      setSubmitted(false);
    },
    onError: () => {
      void showToast({ message: t(I18N_KEYS.members.inviteErrorToast), tone: 'danger' });
    },
  });
  return {
    canInvite,
    openLabel: t(I18N_KEYS.members.invite),
    isOpen,
    onOpen: () => {
      setIsOpen(true);
    },
    onClose: () => {
      setIsOpen(false);
    },
    title: t(I18N_KEYS.members.inviteTitle),
    fullNameLabel: t(I18N_KEYS.members.inviteFullNameLabel),
    fullNamePlaceholder: t(I18N_KEYS.members.inviteFullNamePlaceholder),
    fullName,
    onFullNameChange: setFullName,
    fullNameError:
      submitted && nameError === null ? t(I18N_KEYS.members.inviteFullNameRequired) : null,
    nicknameLabel: t(I18N_KEYS.members.inviteNicknameLabel),
    nickname,
    onNicknameChange: setNickname,
    jerseyLabel: t(I18N_KEYS.members.inviteJerseyLabel),
    jersey,
    onJerseyChange: setJersey,
    submitLabel: t(I18N_KEYS.members.inviteSubmit),
    submittingLabel: t(I18N_KEYS.members.inviteSubmitting),
    cancelLabel: t(I18N_KEYS.members.inviteCancel),
    isSubmitting: mutation.isPending,
    onSubmit: () => {
      setSubmitted(true);
      if (nameError !== null) {
        mutation.mutate(nameError);
      }
    },
  };
}
