import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, PageSeo, PageShell, ReasonField, SectionPanel } from '@/shared/ui';

import type { ContactViewProps } from './contact-view.types';

/** Static Contact Us screen: intro, a real (but not-yet-live) form, and social links. */
export function ContactView(props: ContactViewProps): React.JSX.Element {
  return (
    <PageShell title={props.heroTitle} testId={TEST_IDS.contactPage}>
      <PageSeo title={props.seoTitle} description={props.seoDescription} path={props.path} />
      <div className="app-contact-layout">
        <header className="app-about-hero">
          <IonText>
            <p className="app-eyebrow m-0">{props.heroEyebrow}</p>
          </IonText>
          <IonText>
            <h1 className="m-0 text-3xl font-bold">{props.heroTitle}</h1>
          </IonText>
          <IonText color="medium">
            <p className="m-0 text-base">{props.heroIntro}</p>
          </IonText>
        </header>

        <SectionPanel heading={props.heroTitle}>
          <form onSubmit={props.form.onSubmit} noValidate className="flex flex-col gap-4">
            <div
              role="status"
              aria-live="polite"
              className="app-contact-notice"
              data-testid={TEST_IDS.contactUnavailableNotice}
            >
              <p className="app-contact-notice__title m-0">{props.unavailableTitle}</p>
              <p className="m-0">{props.unavailableMessage}</p>
            </div>

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
