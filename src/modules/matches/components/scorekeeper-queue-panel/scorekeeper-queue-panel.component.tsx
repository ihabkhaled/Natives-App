import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, EmptyState, RecordList, SectionPanel, StatusChip } from '@/shared/ui';

import type { ScorekeeperQueuePanelProps } from './scorekeeper-queue-panel.types';

/**
 * The sync surface: one badge, the queue in recorded order, and — when the
 * server disagrees with what this device queued — a conflict block offering a
 * discard or a reload. There is no merge action anywhere on this panel.
 */
export function ScorekeeperQueuePanel(props: ScorekeeperQueuePanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.scorekeeperQueue}>
      <div className="app-scorekeeper__badge-row">
        <StatusChip
          label={view.badgeLabel}
          tone={view.badgeTone}
          testId={TEST_IDS.scorekeeperQueueBadge}
        />
        {view.hasFailed ? (
          <AppButton
            label={view.retryLabel}
            tone="secondary"
            testId={TEST_IDS.scorekeeperQueueRetry}
            onClick={view.onRetryFailed}
          />
        ) : null}
      </div>

      {view.limitTitle === null || view.limitMessage === null ? null : (
        <div data-testid={TEST_IDS.scorekeeperQueueLimit} className="app-scorekeeper__blocker">
          <EmptyState title={view.limitTitle} message={view.limitMessage} />
        </div>
      )}

      {view.foreignTitle === null || view.foreignMessage === null ? null : (
        <div
          data-testid={TEST_IDS.scorekeeperQueueOtherAccount}
          className="app-scorekeeper__blocker"
        >
          <EmptyState title={view.foreignTitle} message={view.foreignMessage} />
        </div>
      )}

      {view.rows.length === 0 ? (
        <EmptyState title={view.syncedTitle} message={view.syncedMessage} />
      ) : (
        <RecordList
          rows={view.rows}
          ariaLabel={view.heading}
          rowTestId={TEST_IDS.scorekeeperQueueRow}
        />
      )}

      {view.conflicts.length === 0 ? null : (
        <section
          data-testid={TEST_IDS.scorekeeperConflict}
          aria-label={view.conflictHeading}
          className="app-scorekeeper__conflicts"
        >
          <h3 className="app-scorekeeper__conflict-title">{view.conflictHeading}</h3>
          <IonNote>{view.conflictIntro}</IonNote>
          <ul className="app-scorekeeper__conflict-list">
            {view.conflicts.map((conflict) => (
              <li
                key={conflict.key}
                data-testid={TEST_IDS.scorekeeperConflictRow}
                className="app-scorekeeper__conflict"
              >
                <dl className="app-scorekeeper__conflict-facts">
                  <dt>{conflict.queuedLabel}</dt>
                  <dd>{conflict.queuedValue}</dd>
                  <dt>{conflict.serverLabel}</dt>
                  <dd>{conflict.serverValue}</dd>
                </dl>
                <div className="app-scorekeeper__conflict-actions">
                  <AppButton
                    label={conflict.discardLabel}
                    tone="danger"
                    testId={TEST_IDS.scorekeeperConflictDiscard}
                    onClick={conflict.onDiscard}
                  />
                  <AppButton
                    label={conflict.reloadLabel}
                    tone="ghost"
                    testId={TEST_IDS.scorekeeperConflictReload}
                    onClick={conflict.onReload}
                  />
                </div>
              </li>
            ))}
          </ul>
          <IonNote>{view.conflictNote}</IonNote>
        </section>
      )}
    </SectionPanel>
  );
}
