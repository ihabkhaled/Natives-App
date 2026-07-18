import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { AttendanceReadyView } from '../attendance-ready-view';
import { AttendanceStateView } from '../attendance-state-view';
import type { AttendanceViewProps } from './attendance-view.types';

export function AttendanceView(props: AttendanceViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.attendancePage}>
      <main
        data-testid={TEST_IDS.attendanceView}
        className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-24"
        aria-busy={
          props.isSubmitting || props.isFinalizing || props.isCorrecting || props.isReplaying
        }
      >
        <AttendanceStateView
          status={props.status}
          loadingLabel={props.loadingLabel}
          errorTitle={props.errorTitle}
          errorMessage={props.errorMessage}
          retryLabel={props.retryLabel}
          offlineTitle={props.offlineTitle}
          offlineMessage={props.offlineMessage}
          forbiddenTitle={props.forbiddenTitle}
          forbiddenMessage={props.forbiddenMessage}
          emptyTitle={props.emptyTitle}
          emptyMessage={props.emptyMessage}
          onRetry={props.onRetry}
        />
        {props.status === 'ready' ? <AttendanceReadyView {...props} /> : null}
      </main>
    </PageShell>
  );
}
