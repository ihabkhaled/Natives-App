import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, EmptyState, ErrorState } from '@/shared/ui';

import { DashboardWidgetBody } from '../dashboard-widget-body';
import type { DashboardWidgetProps } from './dashboard-widget.types';

/**
 * One dashboard widget card: title, per-widget freshness, and either its
 * prepared body or a designed state — the calm empty disc, or the error disc
 * with a supporting line and a retry action — plus a partial notice.
 */
export function DashboardWidget(props: DashboardWidgetProps): React.JSX.Element {
  const { widget } = props;
  const link = widget.link;
  return (
    <IonCard data-testid={widget.testId} className="m-0">
      <IonCardHeader>
        <IonCardTitle className="text-base font-semibold">{widget.title}</IonCardTitle>
        {widget.freshnessLabel === null ? null : <IonNote>{widget.freshnessLabel}</IonNote>}
      </IonCardHeader>
      <IonCardContent>
        {widget.showsContent ? <DashboardWidgetBody widget={widget} /> : null}
        {widget.stateKind === 'empty' ? (
          <div className="app-widget-state">
            <EmptyState title={widget.stateLabel} />
          </div>
        ) : null}
        {widget.stateKind === 'unavailable' ? (
          <div className="app-widget-state app-widget-state--error">
            <ErrorState
              title={widget.stateLabel}
              message={widget.stateMessage ?? undefined}
              retryLabel={props.retryLabel}
              onRetry={props.onRetry}
            />
          </div>
        ) : null}
        {widget.partialLabel === null ? null : (
          <IonNote className="mt-2 block">{widget.partialLabel}</IonNote>
        )}
        {link === null ? null : (
          <footer className="app-dashboard-widget__footer mt-3 flex justify-end">
            <AppButton
              label={link.label}
              tone="ghost"
              testId={`${TEST_IDS.dashboardWidgetLink}-${widget.kind}`}
              onClick={() => {
                props.onOpenLink(link.path);
              }}
            />
          </footer>
        )}
      </IonCardContent>
    </IonCard>
  );
}
