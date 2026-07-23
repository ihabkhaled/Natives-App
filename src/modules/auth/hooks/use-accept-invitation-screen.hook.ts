import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useSearchParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import { buildSetPasswordFieldsLabels } from '../components/set-password-fields/set-password-fields.helper';
import type {
  DisplayNameFieldView,
  SetPasswordFieldsLabels,
} from '../components/set-password-fields/set-password-fields.types';
import { buildInvitationIntro } from '../helpers/invitation-copy.helper';
import { useAcceptInvitationMutation } from '../mutations/use-accept-invitation-mutation.hook';
import { useBackToLogin } from './use-back-to-login.hook';
import { useInvitationQuery } from './use-invitation-query.hook';
import { useSetPasswordForm, type SetPasswordFormView } from './use-set-password-form.hook';

interface AcceptInvitationScreenLabels {
  readonly title: string;
  readonly emailLabel: string;
  readonly backToLogin: string;
  readonly loading: string;
  readonly invalidTitle: string;
  readonly invalidMessage: string;
  readonly fields: SetPasswordFieldsLabels;
}

export interface AcceptInvitationScreenView {
  readonly labels: AcceptInvitationScreenLabels;
  readonly form: SetPasswordFormView;
  readonly displayNameField: DisplayNameFieldView;
  readonly isLoadingInvitation: boolean;
  readonly isInvitationInvalid: boolean;
  readonly invitationEmail: string | undefined;
  readonly introMessage: string | undefined;
  readonly isSubmitting: boolean;
  readonly submitErrorMessage: string | undefined;
  readonly onBackToLogin: () => void;
}

function buildLabels(t: (key: string) => string): AcceptInvitationScreenLabels {
  return {
    title: t(I18N_KEYS.auth.acceptInvitationTitle),
    emailLabel: t(I18N_KEYS.auth.acceptInvitationEmailLabel),
    backToLogin: t(I18N_KEYS.auth.backToLogin),
    loading: t(I18N_KEYS.auth.invitationLoading),
    invalidTitle: t(I18N_KEYS.auth.invitationInvalidTitle),
    invalidMessage: t(I18N_KEYS.auth.invitationInvalidMessage),
    fields: buildSetPasswordFieldsLabels(
      t,
      t(I18N_KEYS.auth.acceptInvitationSubmit),
      t(I18N_KEYS.auth.acceptInvitationSubmitting),
    ),
  };
}

/**
 * View model for invitation acceptance; the token comes from the URL. The
 * intro names the team and role acceptance will grant, and the optional
 * display name travels with the accept call so the invitee lands signed in
 * under their own name.
 */
export function useAcceptInvitationScreen(): AcceptInvitationScreenView {
  const { t } = useAppTranslation();
  const onBackToLogin = useBackToLogin();
  const token = useSearchParam('token') ?? '';
  const invitationQuery = useInvitationQuery(token);
  const mutation = useAcceptInvitationMutation();
  const [displayName, setDisplayName] = useState('');
  const form = useSetPasswordForm({
    translate: t,
    onValidSubmit: (values) => {
      mutation.accept({ token, password: values.password, displayName: displayName.trim() });
    },
  });
  const invitation = invitationQuery.invitation;
  return {
    labels: buildLabels(t),
    form,
    displayNameField: {
      label: t(I18N_KEYS.auth.acceptInvitationDisplayNameLabel),
      placeholder: t(I18N_KEYS.auth.acceptInvitationDisplayNamePlaceholder),
      value: displayName,
      onChange: setDisplayName,
    },
    isLoadingInvitation: token !== '' && invitationQuery.isLoading,
    isInvitationInvalid: token === '' || invitationQuery.error !== null,
    invitationEmail: invitation?.email,
    introMessage: invitation === undefined ? undefined : buildInvitationIntro(invitation, t),
    isSubmitting: mutation.isSubmitting,
    submitErrorMessage:
      mutation.error === null ? undefined : t(mapErrorCodeToI18nKey(mutation.error.code)),
    onBackToLogin,
  };
}
