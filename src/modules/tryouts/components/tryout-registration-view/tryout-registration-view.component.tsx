import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell, SectionPanel } from '@/shared/ui';

import { TryoutRegistrationForm } from '../tryout-registration-form';
import { TRYOUTS_STATE_TEST_IDS } from '../tryouts-view/tryouts-view.constants';
import type { TryoutRegistrationViewProps } from './tryout-registration-view.types';

/** Public candidate registration: the form, then its outcome. */
export function TryoutRegistrationView(props: TryoutRegistrationViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.tryoutRegistrationPage}>
      <section
        data-testid={TEST_IDS.tryoutRegistrationView}
        aria-label={props.title}
        className="app-tryout-registration flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.intro}</p>
          </IonText>
        </header>

        <p className="app-pending-notice m-0" role="note">
          {props.backendPendingNotice}
        </p>

        <AsyncStateView view={props} variant="card" {...TRYOUTS_STATE_TEST_IDS} />

        {props.result === null && props.status === 'ready' ? (
          <TryoutRegistrationForm view={props} />
        ) : null}

        {props.result === null ? null : (
          <SectionPanel
            heading={props.result.title}
            testId={TEST_IDS.tryoutRegistrationSuccess}
            intro={props.result.message}
          >
            {props.result.reference === null ? null : (
              <IonText>
                <p className="app-consent__reference m-0">
                  {`${props.result.referenceLabel}: ${props.result.reference}`}
                </p>
              </IonText>
            )}
          </SectionPanel>
        )}
      </section>
    </PageShell>
  );
}
