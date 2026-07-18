import { IonNote, IonText } from '@/packages/ionic';
import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/shared/ui';

import { DashboardWidgetList } from '../dashboard-widget-list';
import { DASHBOARD_VIEW_TEST_IDS } from './dashboard-view.constants';
import type { DashboardViewProps } from './dashboard-view.types';

/**
 * Personalized dashboard shell: persona headline, freshness, and exactly one
 * of the loading / error / offline / empty / ready states. Only widgets the
 * principal may see reach the ready state.
 */
export function DashboardView(props: DashboardViewProps): React.JSX.Element {
  return (
    <section
      aria-label={props.title}
      data-testid={DASHBOARD_VIEW_TEST_IDS.view}
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-1">
        <IonText>
          <h2 className="m-0 text-xl font-semibold">{props.title}</h2>
        </IonText>
        {props.updatedLabel === null ? null : <IonNote>{props.updatedLabel}</IonNote>}
      </header>
      {props.status === 'loading' ? (
        <LoadingState
          label={props.loadingLabel}
          testId={DASHBOARD_VIEW_TEST_IDS.loading}
          variant="dashboard"
        />
      ) : null}
      {props.status === 'error' ? (
        <ErrorState
          title={props.errorTitle}
          message={props.errorMessage}
          retryLabel={props.retryLabel}
          onRetry={props.onRetry}
          testId={DASHBOARD_VIEW_TEST_IDS.error}
        />
      ) : null}
      {props.status === 'offline' ? (
        <OfflineState
          title={props.offlineTitle}
          message={props.offlineMessage}
          testId={DASHBOARD_VIEW_TEST_IDS.offline}
        />
      ) : null}
      {props.status === 'empty' ? (
        <EmptyState
          title={props.emptyTitle}
          message={props.emptyMessage}
          testId={DASHBOARD_VIEW_TEST_IDS.empty}
        />
      ) : null}
      {props.status === 'ready' ? (
        <DashboardWidgetList
          widgets={props.widgets}
          isOffline={props.isOffline}
          offlineNoticeLabel={props.offlineNoticeLabel}
        />
      ) : null}
    </section>
  );
}
