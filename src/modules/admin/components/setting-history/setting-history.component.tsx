import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { SettingHistoryEntry } from '../setting-history-entry';
import type { SettingHistoryProps } from './setting-history.types';

/**
 * The selected key's version timeline, newest first: a stacked list that
 * reads the same on mobile and desktop, with per-entry diffs instead of
 * serialized documents.
 */
export function SettingHistory(props: SettingHistoryProps): React.JSX.Element {
  return (
    <div className="app-setting-history" data-testid={TEST_IDS.adminSettingHistory}>
      {props.history.entries.length === 0 ? <IonNote>{props.history.emptyLabel}</IonNote> : null}
      <ol className="app-setting-history__list" aria-label={props.ariaLabel}>
        {props.history.entries.map((entry) => (
          <SettingHistoryEntry key={entry.id} entry={entry} />
        ))}
      </ol>
    </div>
  );
}
