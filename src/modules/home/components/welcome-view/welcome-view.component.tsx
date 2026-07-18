import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, BrandLogo, PageShell } from '@/shared/ui';

import { WELCOME_VIEW_TEST_IDS } from './welcome-view.constants';
import type { WelcomeViewProps } from './welcome-view.types';

export function WelcomeView(props: WelcomeViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.welcomePage} immersive>
      <main className="app-welcome-hero">
        <div className="app-welcome-hero__mark" aria-hidden="true" />
        <div className="app-welcome-hero__content">
          <BrandLogo label={props.logoLabel} size="lg" />
          <IonText color="secondary">
            <p className="app-eyebrow m-0">{props.tagline}</p>
          </IonText>
          <IonText>
            <h1 className="m-0 text-3xl font-bold">{props.title}</h1>
          </IonText>
          <IonText color="medium">
            <p className="m-0 max-w-md text-base">{props.subtitle}</p>
          </IonText>
          <AppButton
            label={props.loginCta}
            onClick={props.onLoginClick}
            testId={WELCOME_VIEW_TEST_IDS.loginCta}
          />
        </div>
      </main>
    </PageShell>
  );
}
