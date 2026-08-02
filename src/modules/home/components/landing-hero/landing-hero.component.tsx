import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { LandingHeroProps } from './landing-hero.types';

/** The landing page's opening statement: who we are, and the two paths in. */
export function LandingHero(props: LandingHeroProps): React.JSX.Element {
  const { view } = props;
  return (
    <header className="app-landing-hero" data-testid={TEST_IDS.landingHero}>
      <div className="app-welcome-hero__mark" aria-hidden="true" />
      <div className="app-landing-hero__content">
        <IonText>
          <p className="app-eyebrow m-0">{view.eyebrow}</p>
        </IonText>
        <IonText>
          <h1 className="m-0 app-landing-hero__title">{view.title}</h1>
        </IonText>
        <IonText color="medium">
          <p className="m-0 app-landing-hero__tagline">{view.tagline}</p>
        </IonText>
        <IonText color="medium">
          <p className="m-0 text-sm">{view.founded}</p>
        </IonText>
        <div className="app-landing-hero__actions">
          <AppButton
            label={view.primaryCtaLabel}
            onClick={view.onPrimaryCta}
            tone="primary"
            testId={TEST_IDS.landingHeroPrimaryCta}
          />
          <AppButton
            label={view.secondaryCtaLabel}
            onClick={view.onSecondaryCta}
            tone="secondary"
            testId={TEST_IDS.landingHeroSecondaryCta}
          />
        </div>
      </div>
    </header>
  );
}
