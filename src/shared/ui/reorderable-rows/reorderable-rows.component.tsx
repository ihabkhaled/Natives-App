import { APP_ICONS } from '@/packages/icons';
import { IonIcon } from '@/packages/ionic';

import { AppButton } from '../button';
import type { ReorderableRowsProps, ReorderableRowView } from './reorderable-rows.types';

function controlFor(
  label: string,
  icon: string,
  disabled: boolean,
  onPress: () => void,
): React.JSX.Element {
  return (
    <button
      type="button"
      className="app-reorderable__control"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onPress}
    >
      <IonIcon icon={icon} aria-hidden="true" />
    </button>
  );
}

function rowControls(row: ReorderableRowView): React.JSX.Element {
  return (
    <div className="app-reorderable__controls">
      {controlFor(row.moveUpLabel, APP_ICONS.arrowUp, !row.canMoveUp, row.onMoveUp)}
      {controlFor(row.moveDownLabel, APP_ICONS.arrowDown, !row.canMoveDown, row.onMoveDown)}
      {row.removeLabel === null || row.onRemove === null
        ? null
        : controlFor(row.removeLabel, APP_ICONS.close, false, row.onRemove)}
    </div>
  );
}

/**
 * The ordered-list frame every ranked editor renders through: one bordered
 * row per entry with accessible move-up/move-down (and optional remove)
 * buttons instead of a drag dependency — keyboard-first and RTL-safe, since
 * vertical arrows read the same in either direction. Array order is the
 * order of record: statuses, session types, tiers, and bands all rank by it.
 */
export function ReorderableRows(props: ReorderableRowsProps): React.JSX.Element {
  return (
    <div className="app-reorderable" data-testid={props.testId}>
      <ol className="app-reorderable__list" aria-label={props.ariaLabel}>
        {props.rows.map((row) => (
          <li key={row.key} className="app-reorderable__row" data-testid={props.rowTestId}>
            <div className="app-reorderable__content">{row.content}</div>
            {rowControls(row)}
          </li>
        ))}
      </ol>
      {props.addLabel === null || props.onAdd === null ? null : (
        <AppButton
          label={props.addLabel}
          tone="secondary"
          disabled={props.addDisabled}
          onClick={props.onAdd}
          testId={props.addTestId}
        />
      )}
    </div>
  );
}
