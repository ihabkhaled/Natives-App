import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, ReasonField, SectionPanel, StatusChip } from '@/shared/ui';

import type { TryoutDecisionPanelProps } from './tryout-decision-panel.types';

/** Decision and offer. Every outcome demands a written reason first. */
export function TryoutDecisionPanel(props: TryoutDecisionPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel
      heading={view.heading}
      intro={view.intro}
      notice={view.forbiddenNotice}
      testId={TEST_IDS.tryoutDecisionPanel}
    >
      {view.currentLabel === null ? null : (
        <StatusChip label={view.currentLabel} tone="secondary" />
      )}
      {view.offerExpiryLabel === null ? null : <IonNote>{view.offerExpiryLabel}</IonNote>}
      <ReasonField
        testId={TEST_IDS.tryoutDecisionReason}
        label={view.reasonLabel}
        placeholder={view.reasonPlaceholder}
        value={view.reasonValue}
        validationMessage={view.validationMessage}
        onChange={view.onReasonChange}
      />
      <div className="app-decision__actions">
        {view.actions.map((action) => (
          <AppButton
            key={action.outcome}
            label={action.label}
            tone={action.tone === 'danger' ? 'danger' : 'primary'}
            testId={action.testId}
            disabled={view.validationMessage !== null}
            loading={view.isSaving}
            onClick={action.onSelect}
          />
        ))}
      </div>
    </SectionPanel>
  );
}
