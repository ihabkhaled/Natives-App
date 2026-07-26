import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import { RebuildDialog } from '../rebuild-dialog';
import type { AnalyticsFreshnessCardProps } from './analytics-freshness-card.types';

/**
 * When the projections were last computed, with a stale warning past the
 * policy age. The rebuild button exists only for holders of the dual grant —
 * absent, not disabled, for everyone else.
 */
export function AnalyticsFreshnessCard(props: AnalyticsFreshnessCardProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      className="app-surface-card app-freshness"
      aria-label={view.heading}
      data-testid={TEST_IDS.analyticsFreshnessCard}
    >
      <div className="app-freshness__head">
        <IonText>
          <h3 className="m-0">{view.heading}</h3>
        </IonText>
        {view.staleBadgeLabel === null ? null : (
          <StatusChip
            testId={TEST_IDS.analyticsStaleBadge}
            label={view.staleBadgeLabel}
            tone="warning"
          />
        )}
      </div>
      <p className="m-0">{view.statusLabel}</p>
      {view.reportBanner === null ? null : (
        <p
          className="app-pending-notice m-0"
          role="status"
          data-testid={TEST_IDS.analyticsRebuildReport}
        >
          {view.reportBanner}
        </p>
      )}
      {view.rebuildLabel === null ? null : (
        <>
          <AppButton
            label={view.rebuildLabel}
            tone="secondary"
            testId={TEST_IDS.analyticsRebuildOpen}
            disabled={view.rebuildDisabledReason !== null}
            onClick={view.onOpenRebuild}
          />
          {view.rebuildDisabledReason === null ? null : (
            <IonNote>{view.rebuildDisabledReason}</IonNote>
          )}
        </>
      )}
      {view.dialog === null ? null : <RebuildDialog view={view.dialog} />}
    </section>
  );
}
