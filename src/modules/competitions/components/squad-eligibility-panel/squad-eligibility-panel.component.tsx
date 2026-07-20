import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, FactList, SectionPanel, StatusChip } from '@/shared/ui';

import { SquadOverrideDialog } from '../squad-override-dialog';
import type { SquadEligibilityPanelProps } from './squad-eligibility-panel.types';

/**
 * Advisory eligibility. Every signal is a prompt, never a gate: a failed row
 * still offers selection, routed through the override dialog.
 */
export function SquadEligibilityPanel(props: SquadEligibilityPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel
      heading={view.heading}
      intro={view.intro}
      notice={view.lockedNotice}
      testId={TEST_IDS.squadEligibilityPanel}
    >
      <p data-testid={TEST_IDS.squadEligibilityAdvisory} className="app-eligibility__advisory m-0">
        {view.advisoryNotice}
      </p>

      <div className="app-eligibility__ratio" data-testid={TEST_IDS.squadRatio}>
        <IonText>
          <h3 className="app-eligibility__subhead m-0">{view.ratioHeading}</h3>
        </IonText>
        <FactList items={view.ratioFacts} ariaLabel={view.ratioHeading} />
        <IonNote>{view.ratioVerdict}</IonNote>
      </div>

      {view.override === null ? null : <SquadOverrideDialog view={view.override} />}

      {view.rows.length === 0 ? (
        <IonNote>{view.emptyLabel}</IonNote>
      ) : (
        <ul className="app-eligibility__list">
          {view.rows.map((row) => (
            <li
              key={row.membershipId}
              data-testid={TEST_IDS.squadEligibilityRow}
              className="app-eligibility__row"
            >
              <div className="app-eligibility__identity">
                <IonText>
                  <h4 className="app-eligibility__name m-0">{row.fullName}</h4>
                </IonText>
                <IonNote>{`${row.attendanceLabel} · ${row.availabilityLabel} · ${row.jerseyLabel}`}</IonNote>
                {row.overrideHint === null ? null : (
                  <IonNote color="warning">{row.overrideHint}</IonNote>
                )}
              </div>
              <ul className="app-eligibility__signals">
                {row.signals.map((signal) => (
                  <li key={signal.key} data-testid={TEST_IDS.squadEligibilitySignal}>
                    <StatusChip
                      label={signal.statusLabel}
                      srPrefix={signal.label}
                      tone={signal.tone}
                    />
                    <IonNote>{signal.label}</IonNote>
                  </li>
                ))}
              </ul>
              <div className="app-eligibility__actions">
                <StatusChip label={row.overallLabel} tone={row.overallTone} />
                <AppButton
                  label={row.actionLabel}
                  tone={row.isSelected ? 'ghost' : 'primary'}
                  testId={row.isSelected ? TEST_IDS.squadRemoveAction : TEST_IDS.squadSelectAction}
                  disabled={row.isActionDisabled}
                  onClick={() => {
                    view.onToggle(row.membershipId);
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionPanel>
  );
}
