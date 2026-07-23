import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { EmptyState, LoadingState, SectionPanel } from '@/shared/ui';

import { PerformanceTrendChart } from '../performance-trend-chart';
import type { MeasurementHistoryPanelProps } from './measurement-history-panel.types';

/**
 * Own measurement history, one designed card per protocol: unit, time range,
 * text summary, and the trend chart with its tabular twin. Honest-empty until
 * staff capture ships (the D8 trade-off, stated in copy, not hidden).
 */
export function MeasurementHistoryPanel(props: MeasurementHistoryPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      data-testid={TEST_IDS.measurementHistoryPanel}
      aria-label={view.title}
      className="flex flex-col gap-4"
    >
      {view.isLoading ? <LoadingState label={view.loadingLabel} variant="list" /> : null}
      {view.unavailableMessage === null ? null : (
        <IonNote color="danger" className="block" role="status">
          {view.unavailableMessage}
        </IonNote>
      )}
      {!view.isLoading && view.unavailableMessage === null && view.protocols.length === 0 ? (
        <EmptyState title={view.emptyTitle} message={view.emptyMessage} />
      ) : null}
      {view.protocols.map((protocol) => (
        <SectionPanel
          key={protocol.protocolId}
          heading={protocol.chart.title}
          intro={protocol.unitLabel}
          testId={TEST_IDS.measurementProtocolCard}
        >
          <div className="flex flex-col gap-2">
            {protocol.rangeLabel === null ? null : (
              <IonNote className="block text-xs">{protocol.rangeLabel}</IonNote>
            )}
            <IonNote className="block text-sm">{protocol.summaryText}</IonNote>
            <PerformanceTrendChart chart={protocol.chart} />
          </div>
        </SectionPanel>
      ))}
    </section>
  );
}
