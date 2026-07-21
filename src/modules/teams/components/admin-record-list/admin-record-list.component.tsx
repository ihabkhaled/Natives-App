import { AppButton, RecordList } from '@/shared/ui';

import type { AdminRecordListProps } from './admin-record-list.types';

/**
 * The design system's record list, with each row's lifecycle controls attached.
 * Every row shows only the moves that are legal from its current state, so
 * nothing on screen is a guaranteed 409.
 */
export function AdminRecordList(props: AdminRecordListProps): React.JSX.Element {
  return (
    <RecordList
      ariaLabel={props.ariaLabel}
      rowTestId={props.rowTestId}
      rows={props.rows.map((row) => ({
        key: row.key,
        label: row.label,
        value: row.value,
        detail: row.detail,
        tone: row.tone,
        // The state chip already carries the value; a second copy of it would
        // be read twice by a screen reader.
        hideValue: true,
        actions: row.canManage ? (
          <div className="app-admin-record__actions">
            <AppButton
              label={row.editLabel}
              tone="secondary"
              onClick={row.onEdit}
              testId={`${props.rowTestId}-edit-${row.key}`}
            />
            {row.transitions.map((transition) => (
              <AppButton
                key={transition.key}
                label={transition.label}
                tone="secondary"
                onClick={transition.onSelect}
                testId={`${props.rowTestId}-${transition.key}-${row.key}`}
              />
            ))}
          </div>
        ) : undefined,
      }))}
    />
  );
}
