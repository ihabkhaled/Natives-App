import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { SOCIAL_LINKS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { CONTACT_FORM_ENABLED } from '../contact.constants';
import { contactPath } from '../routes/contact.paths';
import { submitContactRequest } from '../services/submit-contact.service';
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
  readonly unavailableTitle: string;
  readonly unavailableMessage: string;
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
 * View model for the Contact Us screen. Fields validate for real (the same
 * bounds the backend DTO will enforce). The submit *button* is disabled by
 * `isFormEnabled` (from `CONTACT_FORM_ENABLED`) so a visitor can never fire
 * a request to the not-yet-live endpoint; the handler here always calls the
 * stub seam on a valid submit — harmless today (it makes no network call and
 * always reports "unavailable"), and already wired for the day the flag
 * flips, with nothing left to change in this hook.
 */
export function useContactScreen(): ContactScreenView {
  const { t } = useAppTranslation();
  const keys = I18N_KEYS.contact;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useContactForm({
    translate: t,
    onValidSubmit: (values) => {
      setIsSubmitting(true);
      void submitContactRequest(values).finally(() => {
        setIsSubmitting(false);
      });
    },
  });
  return {
    path: contactPath(),
    seoTitle: `${t(keys.title)} — ${t(I18N_KEYS.common.appName)}`,
    seoDescription: t(keys.metaDescription),
    heroEyebrow: t(keys.heroEyebrow),
    heroTitle: t(keys.heroTitle),
    heroIntro: t(keys.heroIntro),
    isFormEnabled: CONTACT_FORM_ENABLED,
    unavailableTitle: t(keys.unavailableTitle),
    unavailableMessage: t(keys.unavailableMessage),
    emailLabel: t(keys.emailLabel),
    emailPlaceholder: t(keys.emailPlaceholder),
    subjectLabel: t(keys.subjectLabel),
    subjectPlaceholder: t(keys.subjectPlaceholder),
    messageLabel: t(keys.messageLabel),
    messagePlaceholder: t(keys.messagePlaceholder),
    submitLabel: t(keys.submit),
    submittingLabel: t(keys.submitting),
    isSubmitting,
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
