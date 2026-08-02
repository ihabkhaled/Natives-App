import { useEffect } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { SOCIAL_LINKS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { CONTACT_FORM_ENABLED } from '../contact.constants';
import { resolveRejectedContactFields } from '../helpers/contact-field-errors.helper';
import { buildContactNotice } from '../helpers/contact-notice.helper';
import { useSubmitContactMutation } from '../mutations/use-submit-contact-mutation.hook';
import { contactPath } from '../routes/contact.paths';
import type { ContactNoticeView } from '../types/contact.types';
import { useContactForm, type ContactFormView } from './use-contact-form.hook';

interface ContactSocialLink {
  readonly key: string;
  readonly label: string;
  readonly href: string;
}

export interface ContactScreenView {
  readonly path: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly heroEyebrow: string;
  readonly heroTitle: string;
  readonly heroIntro: string;
  readonly isFormEnabled: boolean;
  readonly notice: ContactNoticeView | null;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly subjectLabel: string;
  readonly subjectPlaceholder: string;
  readonly messageLabel: string;
  readonly messagePlaceholder: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly isSubmitting: boolean;
  readonly form: ContactFormView;
  readonly socialHeading: string;
  readonly socialIntro: string;
  readonly socialLinks: readonly ContactSocialLink[];
}

/**
 * View model for the Contact Us screen. A valid submit goes straight to the
 * live `POST /contact` relay; the single notice region announces the outcome
 * — sent, rejected, rate-limited, or channel-unavailable — and the form is
 * cleared only once the send is confirmed, so a failure never loses what the
 * visitor wrote.
 */
export function useContactScreen(): ContactScreenView {
  const { t } = useAppTranslation();
  const keys = I18N_KEYS.contact;
  const mutation = useSubmitContactMutation();
  const form = useContactForm({
    translate: t,
    onValidSubmit: mutation.submit,
    rejectedFields: resolveRejectedContactFields(mutation.error),
    rejectedFieldMessage: t(keys.errorFieldRejected),
  });
  const { reset } = form;
  const { isSent } = mutation;
  useEffect(() => {
    if (isSent) {
      reset();
    }
  }, [isSent, reset]);
  return {
    path: contactPath(),
    seoTitle: `${t(keys.title)} — ${t(I18N_KEYS.common.appName)}`,
    seoDescription: t(keys.metaDescription),
    heroEyebrow: t(keys.heroEyebrow),
    heroTitle: t(keys.heroTitle),
    heroIntro: t(keys.heroIntro),
    isFormEnabled: CONTACT_FORM_ENABLED,
    notice: buildContactNotice({
      translate: t,
      isFormEnabled: CONTACT_FORM_ENABLED,
      isSent,
      error: mutation.error,
      onRetry: mutation.retry,
    }),
    emailLabel: t(keys.emailLabel),
    emailPlaceholder: t(keys.emailPlaceholder),
    subjectLabel: t(keys.subjectLabel),
    subjectPlaceholder: t(keys.subjectPlaceholder),
    messageLabel: t(keys.messageLabel),
    messagePlaceholder: t(keys.messagePlaceholder),
    submitLabel: t(keys.submit),
    submittingLabel: t(keys.submitting),
    isSubmitting: mutation.isSubmitting,
    form,
    socialHeading: t(keys.socialHeading),
    socialIntro: t(keys.socialIntro),
    socialLinks: SOCIAL_LINKS.map((social) => ({
      key: social.key,
      href: social.href,
      label: social.href.replace(/^https:\/\//u, ''),
    })),
  };
}
