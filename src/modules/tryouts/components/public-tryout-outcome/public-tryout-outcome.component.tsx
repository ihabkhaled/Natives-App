import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { PublicTryoutOutcomeProps } from './public-tryout-outcome.types';

/**
 * The answer the server actually gave, announced politely. A duplicate and a
 * waitlist placement each keep their own tone and wording — neither is dressed
 * up as a confirmed place.
 */
export function PublicTryoutOutcome(props: PublicTryoutOutcomeProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      data-testid={TEST_IDS.tryoutRegistrationSuccess}
      className="app-surface-card app-public-outcome"
      aria-label={view.title}
      role="status"
      aria-live="polite"
    >
      <StatusChip label={view.title} tone={view.tone} />
      <IonText>
        <h2 className="app-public-outcome__title m-0">{view.title}</h2>
      </IonText>
      <IonText color="medium">
        <p className="m-0">{view.message}</p>
      </IonText>
      {view.reference === null ? null : (
        <p className="app-consent__reference m-0">{`${view.referenceLabel}: ${view.reference}`}</p>
      )}
      <AppButton
        label={view.resetLabel}
        tone="secondary"
        testId={TEST_IDS.tryoutPublicApplyAnother}
        onClick={view.onReset}
      />
    </section>
  );
}
