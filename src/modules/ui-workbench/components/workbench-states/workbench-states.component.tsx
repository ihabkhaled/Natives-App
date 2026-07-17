import { IonText } from '@/packages/ionic';
import { EmptyState, ErrorState, LoadingState, OfflineState, PermissionState } from '@/shared/ui';

import { WORKBENCH_STATES_TEST_ID } from './workbench-states.constants';
import type { WorkbenchStatesProps } from './workbench-states.types';

export function WorkbenchStates(props: WorkbenchStatesProps): React.JSX.Element {
  return (
    <section data-testid={WORKBENCH_STATES_TEST_ID} className="flex flex-col gap-2">
      <IonText>
        <h2 className="m-0 text-lg font-semibold">{props.heading}</h2>
      </IonText>
      <div className="grid gap-2 sm:grid-cols-2">
        <LoadingState label={props.loadingLabel} />
        <EmptyState title={props.emptyTitle} message={props.emptyMessage} />
        <ErrorState
          title={props.errorTitle}
          retryLabel={props.retryLabel}
          onRetry={props.onRetryDemo}
        />
        <OfflineState title={props.offlineTitle} message={props.offlineMessage} />
        <PermissionState title={props.permissionTitle} message={props.permissionMessage} />
      </div>
    </section>
  );
}
