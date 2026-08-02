import { IonCheckbox, IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, SectionPanel, SelectField } from '@/shared/ui';

import type { TryoutRegistrationFormProps } from './tryout-registration-form.types';

/**
 * The application form for the chosen session. It is a real form: submit is
 * gated on validation and on explicit consent, a closed session is blocked
 * with a reason, and every transition is announced in a polite live region.
 */
export function TryoutRegistrationForm(props: TryoutRegistrationFormProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} notice={view.capacityNotice}>
      <form
        noValidate
        aria-label={view.heading}
        className="app-public-form"
        onSubmit={(event) => {
          event.preventDefault();
          view.onSubmit();
        }}
      >
        <div
          data-testid={TEST_IDS.tryoutPublicFormStatus}
          className="app-public-form__status"
          role="status"
          aria-live="polite"
        >
          {view.blockedNotice ?? view.statusMessage ?? ''}
        </div>

        <SelectField
          testId={TEST_IDS.tryoutRegistrationEvent}
          label={view.eventLabel}
          value={view.eventValue}
          options={view.eventOptions}
          onChange={view.onEventChange}
        />
        <AppInput
          testId={TEST_IDS.tryoutRegistrationName}
          name="fullName"
          label={view.nameLabel}
          placeholder={view.namePlaceholder}
          autocomplete="name"
          value={view.name.value}
          errorMessage={view.name.errorMessage ?? undefined}
          onValueChange={view.name.onChange}
        />
        <AppInput
          testId={TEST_IDS.tryoutRegistrationPreferred}
          name="preferredName"
          label={view.preferredLabel}
          value={view.preferred.value}
          onValueChange={view.preferred.onChange}
        />
        <AppInput
          testId={TEST_IDS.tryoutRegistrationEmail}
          name="email"
          label={view.emailLabel}
          type="email"
          autocomplete="email"
          placeholder={view.emailPlaceholder}
          value={view.email.value}
          errorMessage={view.email.errorMessage ?? undefined}
          onValueChange={view.email.onChange}
        />
        <AppInput
          testId={TEST_IDS.tryoutRegistrationPhone}
          name="phone"
          label={view.phoneLabel}
          value={view.phone.value}
          onValueChange={view.phone.onChange}
        />
        <AppInput
          testId={TEST_IDS.tryoutRegistrationBirthYear}
          name="birthYear"
          label={view.birthYearLabel}
          value={view.birthYear.value}
          errorMessage={view.birthYear.errorMessage ?? undefined}
          onValueChange={view.birthYear.onChange}
        />

        <div className="app-consent">
          <IonText>
            <h3 className="app-consent__title m-0">{view.consentHeading}</h3>
          </IonText>
          <IonCheckbox
            data-testid={TEST_IDS.tryoutRegistrationConsent}
            checked={view.consentGiven}
            labelPlacement="end"
            onIonChange={(event) => {
              view.onConsentChange(event.detail.checked);
            }}
          >
            {view.consentStatement}
          </IonCheckbox>
          <IonNote>{view.consentVersionLabel}</IonNote>
          {view.consentError === null ? null : (
            <IonNote color="danger">{view.consentError}</IonNote>
          )}
        </div>

        <div data-testid={TEST_IDS.tryoutRegistrationPrivacy} className="app-consent__privacy">
          <IonText>
            <h3 className="app-consent__title m-0">{view.privacyHeading}</h3>
          </IonText>
          <IonNote>{view.privacyNotice}</IonNote>
        </div>

        <AppButton
          label={view.submitLabel}
          type="submit"
          tone="primary"
          expand
          testId={TEST_IDS.tryoutRegistrationSubmit}
          disabled={!view.canSubmit}
          loading={view.isSubmitting}
        />
      </form>
    </SectionPanel>
  );
}
