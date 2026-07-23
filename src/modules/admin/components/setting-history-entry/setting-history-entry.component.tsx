import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type {
  SettingDiffRowView,
  SettingHistoryEntryView,
  SettingHistoryLegacyView,
} from '../../types/admin-view.types';
import type { SettingHistoryEntryProps } from './setting-history-entry.types';

function diffRow(row: SettingDiffRowView): React.JSX.Element {
  return (
    <li key={row.key} data-testid={TEST_IDS.adminHistoryDiffRow}>
      <StatusChip label={row.kindLabel} tone={row.tone} srPrefix={row.label} />
      <span className="app-history-diff__label">{row.label}</span>
      {row.beforeLabel === null ? null : (
        <s className="app-history-diff__before">{row.beforeLabel}</s>
      )}
      {row.afterLabel === null ? null : (
        <strong className="app-history-diff__after">{row.afterLabel}</strong>
      )}
    </li>
  );
}

function legacyBlock(legacy: SettingHistoryLegacyView): React.JSX.Element {
  return (
    <div className="app-history-legacy">
      <p className="m-0" role="note">
        {legacy.notice}
      </p>
      <details>
        <summary data-testid={TEST_IDS.adminHistoryLegacyToggle}>{legacy.disclosureLabel}</summary>
        <pre className="app-history-legacy__raw" data-testid={TEST_IDS.adminHistoryLegacyRaw}>
          {legacy.rawJson}
        </pre>
      </details>
      {legacy.replaceLabel === null || legacy.onReplace === null ? null : (
        <AppButton
          label={legacy.replaceLabel}
          tone="secondary"
          onClick={legacy.onReplace}
          testId={TEST_IDS.adminHistoryReplace}
        />
      )}
    </div>
  );
}

function cancelAction(entry: SettingHistoryEntryView): React.JSX.Element | null {
  return entry.cancelLabel === null || entry.onCancel === null ? null : (
    <AppButton
      label={entry.cancelLabel}
      tone="danger"
      loading={entry.isCancelling}
      onClick={entry.onCancel}
      testId={TEST_IDS.adminHistoryCancel}
    />
  );
}

/**
 * One version in the readable history: state chip, Cairo effective moment,
 * actor and reason, the human summary, and the field-level diff against the
 * chronologically previous version. Legacy rows disclose their stored
 * document read-only and offer the guided replace flow; scheduled rows may
 * be cancelled — never rewritten.
 */
export function SettingHistoryEntry(props: SettingHistoryEntryProps): React.JSX.Element {
  const entry = props.entry;
  return (
    <li className="app-history-entry" data-testid={TEST_IDS.adminHistoryEntry}>
      <div className="app-history-entry__head">
        <StatusChip
          label={entry.stateLabel}
          tone={entry.stateTone}
          srPrefix={entry.effectiveLabel}
        />
        <span className="app-history-entry__when">{entry.effectiveLabel}</span>
      </div>
      <IonNote>{entry.actorLabel}</IonNote>
      <IonNote>{entry.noteLabel}</IonNote>
      {entry.summary === null ? null : (
        <p className="app-history-entry__summary m-0">{entry.summary}</p>
      )}
      {entry.notComparableLabel === null ? null : <IonNote>{entry.notComparableLabel}</IonNote>}
      {entry.diffEmptyLabel === null ? null : <IonNote>{entry.diffEmptyLabel}</IonNote>}
      {entry.diffRows.length === 0 ? null : (
        <ul className="app-history-diff">{entry.diffRows.map((row) => diffRow(row))}</ul>
      )}
      {entry.legacy === null ? null : legacyBlock(entry.legacy)}
      {cancelAction(entry)}
    </li>
  );
}
