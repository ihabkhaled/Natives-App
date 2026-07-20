import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { FactList, SectionPanel, StatusChip } from '@/shared/ui';

import type { RosterValidationPanelProps } from './roster-validation-panel.types';

/** The server-side validation preview. The client never recomputes policy. */
export function RosterValidationPanel(props: RosterValidationPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.rosterValidationPanel}>
      <StatusChip label={view.verdictLabel} tone={view.verdictTone} />

      <IonText>
        <h3 className="app-eligibility__subhead m-0">{view.compositionHeading}</h3>
      </IonText>
      <FactList items={view.composition} ariaLabel={view.compositionHeading} />

      <IonText>
        <h3 className="app-eligibility__subhead m-0">{view.violationsHeading}</h3>
      </IonText>
      {view.violations.length === 0 ? (
        <IonNote>{view.violationsEmptyLabel}</IonNote>
      ) : (
        <ul className="app-eligibility__signals">
          {view.violations.map((violation) => (
            <li key={violation.key} data-testid={TEST_IDS.rosterViolation}>
              <StatusChip
                label={violation.severityLabel}
                srPrefix={violation.label}
                tone={violation.tone}
              />
              <IonNote>{violation.label}</IonNote>
            </li>
          ))}
        </ul>
      )}
    </SectionPanel>
  );
}
