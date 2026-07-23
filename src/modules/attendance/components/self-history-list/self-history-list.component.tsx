import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, EmptyState, LoadingState, SectionPanel, StatusChip } from '@/shared/ui';

import type { SelfHistoryListProps } from './self-history-list.types';

/**
 * The member's own newest-first attendance history: one translated row per
 * session with the status chip, lateness/excuse detail, who recorded it, and
 * a "not finalized" hint for open sheets. The list stays bounded — the window
 * only grows one page per press and the builder stops at the contract cap.
 */
export function SelfHistoryList(props: SelfHistoryListProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.title} testId={TEST_IDS.myAttendanceHistorySection}>
      {view.isLoading ? (
        <LoadingState label={view.loadingLabel} variant="card" />
      ) : view.rows.length === 0 ? (
        <EmptyState
          title={view.emptyTitle}
          message={view.emptyMessage}
          testId={TEST_IDS.myAttendanceHistoryEmpty}
        />
      ) : (
        <div className="flex flex-col gap-1">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {view.rows.map((row) => (
              <li
                key={row.sessionId}
                data-testid={TEST_IDS.myAttendanceHistoryRow}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-[color:var(--ion-color-step-150,#e5e5e5)] px-3 py-2"
              >
                <div className="min-w-0">
                  <IonText>
                    <p className="m-0 text-sm font-semibold">{row.dateLabel}</p>
                  </IonText>
                  <IonNote className="block text-xs">{row.typeLabel}</IonNote>
                  {row.sourceLabel === null ? null : (
                    <IonNote className="block text-xs">{row.sourceLabel}</IonNote>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {row.notFinalizedHint === null ? null : (
                    <IonNote className="text-xs">{row.notFinalizedHint}</IonNote>
                  )}
                  {row.latenessLabel === null ? null : (
                    <IonNote className="text-xs">{row.latenessLabel}</IonNote>
                  )}
                  {row.excuseLabel === null ? null : (
                    <IonNote className="text-xs">{row.excuseLabel}</IonNote>
                  )}
                  <StatusChip label={row.statusLabel} tone={row.statusTone} />
                </div>
              </li>
            ))}
          </ul>
          {view.canLoadMore ? (
            <AppButton
              label={view.loadMoreLabel}
              tone="secondary"
              expand
              testId={TEST_IDS.myAttendanceHistoryLoadMore}
              onClick={view.onLoadMore}
            />
          ) : null}
        </div>
      )}
    </SectionPanel>
  );
}
