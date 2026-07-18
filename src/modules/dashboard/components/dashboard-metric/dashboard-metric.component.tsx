import { IonText } from '@/packages/ionic';

import { DASHBOARD_METRIC_TEST_IDS } from './dashboard-metric.constants';
import type { DashboardMetricProps } from './dashboard-metric.types';

/** A single projected KPI. A null projection renders muted, never as zero. */
export function DashboardMetric(props: DashboardMetricProps): React.JSX.Element {
  const { metric } = props;
  return (
    <div className="flex flex-col gap-1">
      <IonText color={metric.hasValue ? metric.color : 'medium'}>
        <p className="m-0 text-3xl font-semibold" data-testid={DASHBOARD_METRIC_TEST_IDS.value}>
          {metric.valueText}
        </p>
      </IonText>
      {metric.unitLabel === null ? null : (
        <IonText color="medium">
          <p className="m-0 text-sm">{metric.unitLabel}</p>
        </IonText>
      )}
    </div>
  );
}
