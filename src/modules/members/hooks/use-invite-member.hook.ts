import { useState } from 'react';

import { useAppTranslation, type TranslateParams } from '@/packages/i18n';
import { useAppMutation, useAppQuery, useQueryClient } from '@/packages/query';
import { copyTextToClipboard } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast, type ShowToastOptions } from '@/shared/ui';

import { resolveInvitationErrorKey } from '../helpers/invitation-error.helper';
import { buildInviteSentView } from '../helpers/invite-sent-view.helper';
import { buildInviteFormCopy } from '../helpers/invite-form-copy.helper';
import {
  isInviteFormValid,
  resolveSubmittedError,
  validateInviteForm,
} from '../helpers/invite-form.helper';
import {
  normalizeOptionalText,
  normalizeRequiredName,
  parseJerseyInput,
} from '../helpers/member-form.helper';
import { resolveRoleLabel } from '../helpers/role-label.helper';
import { buildAssignableRolesQueryOptions } from '../queries/assignable-roles.query';
import { membersQueryKeys } from '../queries/members.keys';
import { invitePersonByEmail } from '../services/invite-member-by-email.service';
import type { AssignableRole, InvitationDelivery } from '../types/members.types';
import type { InviteFormView } from '../types/members-view.types';
import { useInviteFormState } from './use-invite-form-state.hook';

type Translate = (key: string, params?: TranslateParams) => string;

interface RoleSelectView {
  readonly roleOptions: InviteFormView['roleOptions'];
  readonly roleOptionsNotice: string | null;
  readonly roleSelectDisabled: boolean;
  readonly roleHint: string;
}

interface RoleQueryState {
  readonly data: readonly AssignableRole[] | undefined;
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly isSuccess: boolean;
}

/** The inline note the select carries while the catalog loads or has failed. */
function roleOptionsNotice(t: Translate, isPending: boolean, unavailable: boolean): string | null {
  if (isPending) {
    return t(I18N_KEYS.members.inviteRolesLoading);
  }
  return unavailable ? t(I18N_KEYS.members.inviteRolesError) : null;
}

/**
 * The role select is fed by the SERVER's assignable-roles catalog — never a
 * hard-coded list. While it loads or fails the select is disabled with an
 * inline note, and the selected role's server description doubles as the
 * privilege-warning hint.
 */
function buildRoleSelect(
  t: Translate,
  selectedSlug: string,
  query: RoleQueryState,
): RoleSelectView {
  const roles = query.data ?? [];
  const unavailable = query.isError || (query.isSuccess && roles.length === 0);
  const selected = roles.find((role) => role.slug === selectedSlug);
  return {
    roleOptions: roles.map((role) => ({
      value: role.slug,
      label: resolveRoleLabel(t, role.slug, role.displayName),
    })),
    roleOptionsNotice: roleOptionsNotice(t, query.isPending, unavailable),
    roleSelectDisabled: query.isPending || unavailable,
    roleHint:
      selected !== undefined && selected.description.trim() !== ''
        ? selected.description
        : t(I18N_KEYS.members.inviteRoleHint),
  };
}

/** Copy the accept link and confirm (or deny) it, without hiding the value. */
function copyAcceptLink(
  t: Translate,
  showToast: (options: ShowToastOptions) => Promise<void>,
  url: string,
): void {
  void copyTextToClipboard(url).then((copied) =>
    showToast({
      message: t(
        copied
          ? I18N_KEYS.members.inviteLinkCopiedToast
          : I18N_KEYS.members.inviteLinkCopyFailedToast,
      ),
      tone: copied ? 'success' : 'danger',
    }),
  );
}

/**
 * Inviting a real person: one flow, two records.
 *
 * The form collects the email, the TEAM role acceptance will grant, and the
 * roster profile the directory needs, then reports what actually happened:
 * the receipt states the team and role back, plus the one-time accept link as
 * the manual fallback for the dev/console email adapter. Failures resolve to
 * specific copy (duplicate, above-ceiling, missing permission) rather than a
 * generic retry toast.
 */
export function useInviteMember(
  teamId: string,
  canInvite: boolean,
  teamName: string,
): InviteFormView {
  const { t, locale } = useAppTranslation();
  const { showToast } = useAppToast();
  const queryClient = useQueryClient();
  const form = useInviteFormState(locale);
  const [sent, setSent] = useState<InvitationDelivery | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const errors = validateInviteForm(form.email, form.fullName);
  const rolesQuery = useAppQuery<readonly AssignableRole[]>(
    buildAssignableRolesQueryOptions(teamId, canInvite && form.isOpen),
  );
  const mutation = useAppMutation({
    mutationFn: () =>
      invitePersonByEmail(teamId, {
        email: form.email.trim(),
        teamRole: form.role,
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
    ...buildRoleSelect(t, form.role, rolesQuery),
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
    emailError: resolveSubmittedError(t, form.isSubmitted, errors.email),
    role: form.role,
    onRoleChange: form.setRole,
    fullName: form.fullName,
    onFullNameChange: form.setFullName,
    fullNameError: resolveSubmittedError(t, form.isSubmitted, errors.fullName),
    nickname: form.nickname,
    onNicknameChange: form.setNickname,
    jersey: form.jersey,
    onJerseyChange: form.setJersey,
    isSubmitting: mutation.isPending,
    errorMessage: errorKey === null ? null : t(errorKey),
    sent:
      sent === null
        ? null
        : buildInviteSentView(t, sent, teamName, {
            formatExpiry: form.formatExpiry,
            onCopy: () => {
              copyAcceptLink(t, showToast, sent.acceptUrl);
            },
            onDone: () => {
              form.reset();
              setSent(null);
            },
          }),
    onSubmit: () => {
      // P1-7: a second tap while the first submission is in flight must not
      // double-fire the invitation POST — the guard sits before any state.
      if (mutation.isPending) {
        return;
      }
      form.markSubmitted();
      setErrorKey(null);
      if (isInviteFormValid(errors)) {
        mutation.mutate(undefined);
      }
    },
  };
}
