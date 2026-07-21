import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, RecordList, SectionPanel, SelectField } from '@/shared/ui';

import type { RuleDetailPanelProps } from './rule-detail-panel.types';

/**
 * One rule version's entries, its lifecycle actions, and the dry run that
 * must precede an activation.
 */
export function RuleDetailPanel(props: RuleDetailPanelProps): React.JSX.Element {
  return (
    <div
      data-testid={TEST_IDS.adminRulePanel}
      className="app-admin-rules__detail flex flex-col gap-5"
    >
      <SectionPanel
        heading={props.entriesHeading}
        intro={props.entriesIntro}
        testId={TEST_IDS.adminRuleEntries}
      >
        <RecordList rows={props.entryRows} ariaLabel={props.entriesHeading} />
      </SectionPanel>

      <SectionPanel
        heading={props.lifecycleHeading}
        intro={props.lifecycleIntro}
        notice={props.publishBlockedNotice}
        testId={TEST_IDS.adminRuleLifecycle}
      >
        <div className="app-admin-rules__actions">
          {props.actions.map((action) => (
            <AppButton
              key={action.key}
              label={action.label}
              tone={action.tone as 'primary'}
              disabled={action.disabled}
              testId={TEST_IDS.adminRuleTransition}
              onClick={action.onSelect}
            />
          ))}
        </div>
      </SectionPanel>

      <SectionPanel
        heading={props.simulation.heading}
        intro={props.simulation.intro}
        notice={props.simulation.validationMessage}
        testId={TEST_IDS.adminRuleSimulation}
      >
        <SelectField
          label={props.simulation.memberLabel}
          value={props.simulation.memberValue}
          options={props.simulation.memberOptions}
          onChange={props.simulation.onMemberChange}
          testId={TEST_IDS.adminRuleSimulateMember}
        />
        <AppButton
          label={props.simulation.runLabel}
          tone="secondary"
          loading={props.simulation.isRunning}
          disabled={props.simulation.validationMessage !== null || props.simulation.isRunning}
          testId={TEST_IDS.adminRuleSimulateRun}
          onClick={props.simulation.onRun}
        />
        <RecordList
          rows={props.simulation.rows}
          ariaLabel={props.simulation.heading}
          testId={TEST_IDS.adminRuleSimulateResult}
        />
        <IonNote>{props.heading}</IonNote>
      </SectionPanel>
    </div>
  );
}
