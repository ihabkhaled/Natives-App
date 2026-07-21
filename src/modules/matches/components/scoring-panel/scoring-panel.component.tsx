import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel, SelectField } from '@/shared/ui';

import type { ScoringPanelProps } from './scoring-panel.types';

/**
 * The two scoring targets, sized for a thumb on a wet sideline: they fill the
 * row, stand at least 72px tall, and stay disabled — not merely dimmed —
 * whenever the queue is full, scoring is closed, or the grant is missing.
 */
export function ScoringPanel(props: ScoringPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel
      heading={view.heading}
      intro={view.intro}
      notice={view.blockedNotice}
      testId={TEST_IDS.scoreboardScoring}
    >
      <div className="app-scorekeeper__pickers">
        <SelectField
          testId={TEST_IDS.scoreboardScorerSelect}
          label={view.scorerLabel}
          value={view.scorerValue}
          options={view.scorerOptions}
          onChange={view.onScorerChange}
        />
        <SelectField
          testId={TEST_IDS.scoreboardAssistSelect}
          label={view.assistLabel}
          value={view.assistValue}
          options={view.assistOptions}
          onChange={view.onAssistChange}
        />
      </div>

      <div className="app-scorekeeper__targets">
        <div className="app-scorekeeper__target app-scorekeeper__target--us">
          <AppButton
            label={view.usControl.label}
            tone="primary"
            expand
            testId={view.usControl.testId}
            disabled={view.usControl.disabled}
            loading={view.usControl.loading}
            onClick={view.usControl.onPress}
          />
        </div>
        <div className="app-scorekeeper__target">
          <AppButton
            label={view.themControl.label}
            tone="secondary"
            expand
            testId={view.themControl.testId}
            disabled={view.themControl.disabled}
            loading={view.themControl.loading}
            onClick={view.themControl.onPress}
          />
        </div>
      </div>
    </SectionPanel>
  );
}
