import { TEST_IDS } from '@/shared/config';
import {
  AppButton,
  AppInput,
  PageSeo,
  PageShell,
  PublicPageHero,
  ReasonField,
  SectionPanel,
} from '@/shared/ui';

import { ContactNotice } from '../contact-notice';
import type { ContactViewProps } from './contact-view.types';

/** Contact Us screen: intro, the live message form, and social links. */
export function ContactView(props: ContactViewProps): React.JSX.Element {
  return (
    <PageShell title={props.heroTitle} testId={TEST_IDS.contactPage}>
      <PageSeo title={props.seoTitle} description={props.seoDescription} path={props.path} />
      <div className="app-contact-layout">
        <PublicPageHero
          className="app-about-hero"
          eyebrow={props.heroEyebrow}
          title={props.heroTitle}
          intro={props.heroIntro}
        />

        <SectionPanel heading={props.heroTitle}>
          <form
            onSubmit={props.form.onSubmit}
            noValidate
            data-testid={TEST_IDS.contactForm}
            className="flex flex-col gap-4"
          >
            <ContactNotice notice={props.notice} />

            <AppInput
              label={props.emailLabel}
              name={props.form.email.name}
              value={props.form.email.value}
              onValueChange={props.form.email.onChange}
              onBlur={props.form.email.onBlur}
              type="email"
              placeholder={props.emailPlaceholder}
              errorMessage={props.form.email.errorMessage}
              autocomplete="email"
              disabled={!props.isFormEnabled}
              testId={TEST_IDS.contactEmailInput}
            />
            <AppInput
              label={props.subjectLabel}
              name={props.form.subject.name}
              value={props.form.subject.value}
              onValueChange={props.form.subject.onChange}
              onBlur={props.form.subject.onBlur}
              placeholder={props.subjectPlaceholder}
              errorMessage={props.form.subject.errorMessage}
              disabled={!props.isFormEnabled}
              testId={TEST_IDS.contactSubjectInput}
            />
            <ReasonField
              label={props.messageLabel}
              placeholder={props.messagePlaceholder}
              value={props.form.message.value}
              validationMessage={props.form.message.errorMessage ?? null}
              onChange={props.form.message.onChange}
              testId={TEST_IDS.contactMessageInput}
            />

            <AppButton
              label={props.isSubmitting ? props.submittingLabel : props.submitLabel}
              type="submit"
              expand
              loading={props.isSubmitting}
              disabled={!props.isFormEnabled}
              testId={TEST_IDS.contactSubmitButton}
            />
          </form>
        </SectionPanel>

        <SectionPanel heading={props.socialHeading} intro={props.socialIntro}>
          <ul className="app-contact-social-list">
            {props.socialLinks.map((social) => (
              <li key={social.key}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-testid={`${TEST_IDS.contactSocialLink}-${social.key}`}
                  className="app-contact-social-link"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </SectionPanel>
      </div>
    </PageShell>
  );
}
