import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonNote } from '@/packages/ionic';

import { DashboardWidgetBody } from '../dashboard-widget-body';
import type { DashboardWidgetProps } from './dashboard-widget.types';

/**
 * One dashboard widget card: title, per-widget freshness, and either its
 * prepared body or a state note (empty/unavailable), plus a partial notice.
 */
export function DashboardWidget(props: DashboardWidgetProps): React.JSX.Element {
  const { widget } = props;
  return (
    <IonCard data-testid={widget.testId} className="m-0">
      <IonCardHeader>
        <IonCardTitle className="text-base font-semibold">{widget.title}</IonCardTitle>
        {widget.freshnessLabel === null ? null : <IonNote>{widget.freshnessLabel}</IonNote>}
      </IonCardHeader>
      <IonCardContent>
        {widget.showsContent ? (
          <DashboardWidgetBody widget={widget} />
        ) : (
          <IonNote>{widget.stateLabel}</IonNote>
        )}
        {widget.partialLabel === null ? null : (
          <IonNote className="mt-2 block">{widget.partialLabel}</IonNote>
        )}
      </IonCardContent>
    </IonCard>
  );
}
