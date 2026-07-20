import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import { TryoutConversionPanel } from '../tryout-conversion-panel';
import { TryoutDecisionPanel } from '../tryout-decision-panel';
import { TryoutEvaluationPanel } from '../tryout-evaluation-panel';
import { TryoutRestrictedBlock } from '../tryout-restricted-block';
import type { TryoutCandidatePanelProps } from './tryout-candidate-panel.types';

/** One candidate: restricted data first, then evaluation, decision, conversion. */
export function TryoutCandidatePanel(props: TryoutCandidatePanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <div
      data-testid={TEST_IDS.tryoutCandidatePanel}
      aria-label={view.heading}
      className="app-candidate-panel"
    >
      <header className="app-candidate-panel__head">
        <IonText>
          <h2 className="app-candidate-panel__title m-0">{view.heading}</h2>
        </IonText>
        <StatusChip label={view.statusLabel} tone={view.statusTone} />
        <IonNote>{view.referenceLabel}</IonNote>
        <IonNote>{view.consentLabel}</IonNote>
      </header>

      <TryoutRestrictedBlock
        view={view.contacts}
        testId={TEST_IDS.tryoutContacts}
        restrictedTestId={TEST_IDS.tryoutContactsRestricted}
      />
      <TryoutRestrictedBlock
        view={view.readiness}
        testId={TEST_IDS.tryoutReadiness}
        restrictedTestId={TEST_IDS.tryoutReadinessRestricted}
      />
      <TryoutEvaluationPanel view={view.evaluation} />
      <TryoutDecisionPanel view={view.decision} />
      <TryoutConversionPanel view={view.conversion} />
    </div>
  );
}
