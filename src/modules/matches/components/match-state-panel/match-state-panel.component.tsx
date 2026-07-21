import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel } from '@/shared/ui';

import type { MatchStatePanelProps } from './match-state-panel.types';

/**
 * The match state machine. Only the transitions the current status allows are
 * enabled; the server re-checks the same rule with the record version, so a
 * stale device cannot pause a match someone else already completed.
 */
export function MatchStatePanel(props: MatchStatePanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.scoreboardState}>
      <div className="app-scorekeeper__transitions">
        {view.buttons.map((button) => (
          <AppButton
            key={button.transition}
            label={button.label}
            tone="secondary"
            testId={`${TEST_IDS.scoreboardTransition}-${button.transition}`}
            disabled={button.disabled}
            loading={view.isRunning}
            onClick={() => {
              view.onTransition(button.transition);
            }}
          />
        ))}
      </div>
    </SectionPanel>
  );
}
