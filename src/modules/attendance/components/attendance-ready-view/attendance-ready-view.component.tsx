import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { AttendanceActionBar } from '../attendance-action-bar';
import { AttendanceHistoryPanel } from '../attendance-history-panel';
import { AttendanceRosterList } from '../attendance-roster-list';
import { AttendanceSummary } from '../attendance-summary';
import { AttendanceToolbar } from '../attendance-toolbar';
import type { AttendanceReadyViewProps } from './attendance-ready-view.types';

export function AttendanceReadyView(props: AttendanceReadyViewProps): React.JSX.Element {
  return (
    <>
      <AttendanceSummary
        subtitle={props.subtitle}
        sessionLabel={props.sessionLabel}
        sheetStateLabel={props.sheetStateLabel}
        rosterSummary={props.rosterSummary}
        queueSummary={props.queueSummary}
        finalizedLabel={props.finalizedLabel}
      />
      {props.isOffline ? (
        <div
          role="status"
          className="rounded-2xl border border-[color:var(--ion-color-warning)] bg-[color:rgba(var(--ion-color-warning-rgb),0.1)] p-3"
        >
          <IonNote color="warning">{props.offlineQueueNotice}</IonNote>
        </div>
      ) : null}
      <div
        data-testid={TEST_IDS.attendancePrivacyNotice}
        className="rounded-2xl border border-[color:var(--ion-color-tertiary)] bg-[color:rgba(var(--ion-color-tertiary-rgb),0.08)] p-3"
      >
        <IonNote color="medium">{props.privacyNotice}</IonNote>
      </div>
      <AttendanceToolbar
        searchLabel={props.searchLabel}
        searchPlaceholder={props.searchPlaceholder}
        searchValue={props.searchValue}
        filterLabel={props.filterLabel}
        filterAllLabel={props.filterAllLabel}
        filterValue={props.filterValue}
        statusOptions={props.statusOptions}
        selectedCountLabel={props.selectedCountLabel}
        selectAllVisibleLabel={props.selectAllVisibleLabel}
        markAllPresentLabel={props.markAllPresentLabel}
        markSelectedPresentLabel={props.markSelectedPresentLabel}
        markSelectedAbsentLabel={props.markSelectedAbsentLabel}
        undoLabel={props.undoLabel}
        canUndo={props.canUndo}
        onSearchChange={props.onSearchChange}
        onFilterChange={props.onFilterChange}
        onSelectAllVisible={props.onSelectAllVisible}
        onMarkAllPresent={props.onMarkAllPresent}
        onMarkSelectedPresent={props.onMarkSelectedPresent}
        onMarkSelectedAbsent={props.onMarkSelectedAbsent}
        onUndo={props.onUndo}
      />
      <AttendanceRosterList
        subtitle={props.subtitle}
        rows={props.rows}
        noMatchesTitle={props.noMatchesTitle}
        noMatchesMessage={props.noMatchesMessage}
        resolveConflictLabel={props.resolveConflictLabel}
        isSubmitting={props.isSubmitting}
        isCorrecting={props.isCorrecting}
        isReplaying={props.isReplaying}
        onToggleMember={props.onToggleMember}
        onStatusChange={props.onStatusChange}
        onLatenessChange={props.onLatenessChange}
        onExcuseChange={props.onExcuseChange}
        onCorrectionReasonChange={props.onCorrectionReasonChange}
        onResolveConflict={props.onResolveConflict}
        onShowHistory={props.onShowHistory}
        onSaveCorrection={props.onSaveCorrection}
      />
      <AttendanceActionBar
        canRetryQueue={props.canRetryQueue}
        retryQueueLabel={props.retryQueueLabel}
        saveLabel={props.saveLabel}
        canSubmit={props.canSubmit}
        isSubmitting={props.isSubmitting}
        finalizeLabel={props.finalizeLabel}
        canFinalize={props.canFinalize}
        isFinalizing={props.isFinalizing}
        onRetryQueue={props.onRetryQueue}
        onSubmit={props.onSubmit}
        onFinalize={props.onFinalize}
      />
      {props.historyMembershipId === null ? null : (
        <AttendanceHistoryPanel
          historyTitle={props.historyTitle}
          historyEmptyLabel={props.historyEmptyLabel}
          historyLoadingLabel={props.historyLoadingLabel}
          historyMembershipId={props.historyMembershipId}
          historyItems={props.historyItems}
          isHistoryLoading={props.isHistoryLoading}
        />
      )}
    </>
  );
}
