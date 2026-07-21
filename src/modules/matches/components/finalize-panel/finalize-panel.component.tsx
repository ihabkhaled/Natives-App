import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel } from '@/shared/ui';

import type { FinalizePanelProps } from './finalize-panel.types';

/**
 * Finalization. The blocked reason is rendered as its own note so a
 * scorekeeper knows whether to reconnect, refresh, or finish the match — a
 * disabled button alone would not say which.
 */
export function FinalizePanel(props: FinalizePanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.scoreboardFinalize}>
      {view.blockedNotice === null ? (
        <IonNote>{view.statusNotice}</IonNote>
      ) : (
        <p
          data-testid={TEST_IDS.scoreboardFinalizeBlocked}
          className="app-scorekeeper__blocked m-0"
          role="note"
        >
          {view.blockedNotice}
        </p>
      )}
      <AppButton
        label={view.actionLabel}
        tone="primary"
        testId={TEST_IDS.scoreboardFinalizeAction}
        disabled={view.disabled}
        loading={view.isRunning}
        onClick={view.onFinalize}
      />
    </SectionPanel>
  );
}
