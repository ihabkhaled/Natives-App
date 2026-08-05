import { TEST_IDS } from '@/shared/config';
import { AppButton, DetailScreen, StatusChip } from '@/shared/ui';

import { DrillForm } from '../drill-form';
import type { DrillDetailViewProps } from './drill-detail-view.types';

/**
 * The drill detail/edit screen: the status chip, the write form, and the
 * lifecycle control. The archive button is absent — not merely disabled —
 * once a drill is already archived; a plain notice takes its place instead,
 * because there is nothing left to retire.
 */
export function DrillDetailView(props: DrillDetailViewProps): React.JSX.Element {
  return (
    <DetailScreen
      title={props.title}
      heading={props.heading}
      pageTestId={TEST_IDS.drillDetailPage}
      viewTestId={TEST_IDS.drillDetailView}
      className="app-drill-detail"
      backLabel={props.backLabel}
      backTestId={TEST_IDS.drillDetailBack}
      onBack={props.onBack}
      notice={null}
      state={{
        view: props,
        variant: 'detail',
        loadingTestId: TEST_IDS.drillDetailLoading,
        errorTestId: TEST_IDS.drillDetailError,
        offlineTestId: TEST_IDS.drillDetailOffline,
        forbiddenTestId: TEST_IDS.drillDetailForbidden,
        emptyTestId: TEST_IDS.drillDetailEmpty,
      }}
    >
      {props.statusLabel === null ? null : (
        <StatusChip
          label={props.statusLabel}
          tone={props.statusTone ?? 'medium'}
          testId={TEST_IDS.drillStatusChip}
        />
      )}

      <DrillForm form={props.form} />

      {props.lifecycle.notice === null ? null : (
        <p
          className="app-pending-notice m-0"
          role="note"
          data-testid={TEST_IDS.drillArchivedNotice}
        >
          {props.lifecycle.notice}
        </p>
      )}

      {props.lifecycle.visible ? (
        <AppButton
          label={props.lifecycle.actionLabel}
          tone="danger"
          loading={props.lifecycle.isBusy}
          onClick={props.lifecycle.onArchive}
          testId={TEST_IDS.drillArchiveButton}
        />
      ) : null}
    </DetailScreen>
  );
}
