import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageSeo, PageShell, SectionPanel } from '@/shared/ui';

import { PublicTryoutCard } from '../public-tryout-card';
import { PublicTryoutOutcome } from '../public-tryout-outcome';
import { TryoutRegistrationForm } from '../tryout-registration-form';
import { TRYOUTS_STATE_TEST_IDS } from '../tryouts-view/tryouts-view.constants';
import type { PublicTryoutsViewProps } from './public-tryouts-view.types';

/**
 * The public tryouts page: browse the open sessions, then apply to the one you
 * picked. Sessions and form sit side by side from tablet up and stack on
 * mobile; the "what happens next" panel stays visible in every state, so an
 * empty or failed list still reads as a real page.
 */
export function PublicTryoutsView(props: PublicTryoutsViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.tryoutRegistrationPage}>
      <PageSeo title={props.seoTitle} description={props.seoDescription} path={props.path} />
      <div data-testid={TEST_IDS.tryoutRegistrationView} className="app-public-tryouts">
        <header className="app-public-tryouts__hero">
          <IonText>
            <p className="app-eyebrow m-0">{props.eyebrow}</p>
          </IonText>
          <IonText>
            <h1 className="app-public-tryouts__title m-0">{props.title}</h1>
          </IonText>
          <IonText color="medium">
            <p className="app-public-tryouts__intro m-0">{props.intro}</p>
          </IonText>
        </header>

        <AsyncStateView view={props} variant="list" {...TRYOUTS_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <div className="app-public-tryouts__layout">
            <SectionPanel heading={props.sessionsHeading} intro={props.sessionsIntro}>
              <ul data-testid={TEST_IDS.tryoutPublicSessions} className="app-public-sessions">
                {props.cards.map((card) => (
                  <PublicTryoutCard key={card.id} item={card} />
                ))}
              </ul>
            </SectionPanel>

            {props.outcome === null ? (
              <TryoutRegistrationForm view={props.form} />
            ) : (
              <PublicTryoutOutcome view={props.outcome} />
            )}
          </div>
        ) : null}

        <SectionPanel heading={props.stepsHeading} testId={TEST_IDS.tryoutPublicSteps}>
          <ol className="app-public-steps">
            {props.steps.map((step) => (
              <li key={step.key} className="app-public-steps__item">
                <IonText>
                  <h3 className="app-public-steps__title m-0">{step.title}</h3>
                </IonText>
                <IonText color="medium">
                  <p className="m-0 text-sm">{step.body}</p>
                </IonText>
              </li>
            ))}
          </ol>
        </SectionPanel>
      </div>
    </PageShell>
  );
}
