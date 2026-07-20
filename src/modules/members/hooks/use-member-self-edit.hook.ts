import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import {
  buildSelfEditInitialValues,
  normalizeOptionalText,
  normalizeRequiredName,
  parseJerseyInput,
} from '../helpers/member-form.helper';
import { useUpdateProfileMutation } from '../mutations/use-update-profile-mutation.hook';
import type { SelfEditView } from '../types/members-view.types';
import type { MemberProfile } from '../types/members.types';

/** Self profile-edit dialog state wired to the optimistic update mutation. */
export function useMemberSelfEdit(
  teamId: string,
  profile: MemberProfile | undefined,
  canEdit: boolean,
): SelfEditView {
  const { t } = useAppTranslation();
  const { showToast } = useAppToast();
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [jersey, setJersey] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const nameError = normalizeRequiredName(fullName);
  const toast = (key: string, tone: 'success' | 'warning' | 'danger'): void => {
    void showToast({ message: t(key), tone });
  };
  const mutation = useUpdateProfileMutation(teamId, profile?.membershipId ?? '', {
    onSuccess: () => {
      toast(I18N_KEYS.members.selfEditSuccessToast, 'success');
      setIsOpen(false);
      setSubmitted(false);
    },
    onConflict: () => {
      toast(I18N_KEYS.members.selfEditConflictToast, 'warning');
    },
    onError: () => {
      toast(I18N_KEYS.members.selfEditErrorToast, 'danger');
    },
  });
  return {
    canEdit,
    openLabel: t(I18N_KEYS.members.selfEditOpen),
    isOpen,
    onOpen: () => {
      const initial = buildSelfEditInitialValues(profile);
      setFullName(initial.fullName);
      setNickname(initial.nickname);
      setJersey(initial.jersey);
      setSubmitted(false);
      setIsOpen(true);
    },
    onClose: () => {
      setIsOpen(false);
    },
    title: t(I18N_KEYS.members.selfEditTitle),
    fullNameLabel: t(I18N_KEYS.members.selfEditFullNameLabel),
    fullName,
    onFullNameChange: setFullName,
    fullNameError:
      submitted && nameError === null ? t(I18N_KEYS.members.selfEditFullNameRequired) : null,
    nicknameLabel: t(I18N_KEYS.members.selfEditNicknameLabel),
    nickname,
    onNicknameChange: setNickname,
    jerseyLabel: t(I18N_KEYS.members.selfEditJerseyLabel),
    jersey,
    onJerseyChange: setJersey,
    submitLabel: t(I18N_KEYS.members.selfEditSubmit),
    submittingLabel: t(I18N_KEYS.members.selfEditSubmitting),
    cancelLabel: t(I18N_KEYS.members.selfEditCancel),
    isSubmitting: mutation.isSubmitting,
    onSubmit: () => {
      setSubmitted(true);
      if (nameError !== null) {
        mutation.submit({
          fullName: nameError,
          nickname: normalizeOptionalText(nickname),
          jerseyNumber: parseJerseyInput(jersey),
          expectedVersion: profile?.version ?? 1,
        });
      }
    },
  };
}
