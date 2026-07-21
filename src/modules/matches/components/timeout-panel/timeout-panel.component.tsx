import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel } from '@/shared/ui';

import type { TimeoutPanelProps } from './timeout-panel.types';

/**
 * Timeouts, with the remaining allowance printed next to each control. The
 * allowance comes from the rule set the server resolved, so a format with no
 * timeouts disables both buttons rather than offering one that will 409.
 */
export function TimeoutPanel(props: TimeoutPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} testId={TEST_IDS.scoreboardTimeouts}>
      <div className="app-scorekeeper__timeouts">
        <div className="app-scorekeeper__timeout">
          <AppButton
            label={view.usControl.label}
            tone="secondary"
            expand
            testId={view.usControl.testId}
            disabled={view.usControl.disabled}
            loading={view.usControl.loading}
            onClick={view.usControl.onPress}
          />
          <IonNote>{view.usRemainingLabel}</IonNote>
        </div>
        <div className="app-scorekeeper__timeout">
          <AppButton
            label={view.themControl.label}
            tone="secondary"
            expand
            testId={view.themControl.testId}
            disabled={view.themControl.disabled}
            loading={view.themControl.loading}
            onClick={view.themControl.onPress}
          />
          <IonNote>{view.themRemainingLabel}</IonNote>
        </div>
      </div>
    </SectionPanel>
  );
}
