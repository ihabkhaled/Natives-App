import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, RecordList, SelectField, type RecordListRow } from '@/shared/ui';

import type { RsvpRosterProps } from './rsvp-roster.types';

/**
 * The session roster: a status filter, the match count, one row per
 * participant, and "load more" for a roster wider than the current window.
 *
 * Split from the screen so the screen owns only which state to show. Each
 * row carries its own override and history buttons rather than a second list
 * component — the same choice `RecordList`'s row `actions` slot exists for.
 */
export function RsvpRoster(props: RsvpRosterProps): React.JSX.Element {
  const rows: readonly RecordListRow[] = props.rows.map((row) => ({
    key: row.membershipId,
    label: row.idLabel,
    value: row.statusLabel,
    detail: row.detailLabel,
    tone: row.statusTone,
    actions: (
      <div className="flex gap-2">
        <AppButton
          label={row.overrideLabel}
          onClick={row.onOverride}
          testId={TEST_IDS.practiceRsvpDetailOverrideAction}
          tone="secondary"
        />
        <AppButton
          label={row.historyLabel}
          onClick={row.onViewHistory}
          testId={TEST_IDS.practiceRsvpDetailHistoryAction}
          tone="ghost"
        />
      </div>
    ),
  }));

  return (
    <section aria-label={props.countLabel} className="app-section-panel flex flex-col gap-3">
      <SelectField
        label={props.statusFilterLabel}
        value={props.statusFilter}
        options={props.statusFilterOptions}
        onChange={props.onStatusFilterChange}
        testId={TEST_IDS.practiceRsvpDetailStatusFilter}
      />
      <IonNote data-testid={TEST_IDS.practiceRsvpDetailCount}>{props.countLabel}</IonNote>
      {rows.length === 0 ? (
        <IonNote data-testid={TEST_IDS.practiceRsvpDetailRosterEmpty}>{props.emptyLabel}</IonNote>
      ) : (
        <RecordList
          rows={rows}
          ariaLabel={props.countLabel}
          testId={TEST_IDS.practiceRsvpDetailRoster}
          rowTestId={TEST_IDS.practiceRsvpDetailRosterRow}
        />
      )}
      {props.hasMore ? (
        <AppButton
          label={props.loadMoreLabel}
          loading={props.isLoadingMore}
          onClick={props.onLoadMore}
          testId={TEST_IDS.practiceRsvpDetailLoadMore}
          tone="secondary"
        />
      ) : null}
    </section>
  );
}
