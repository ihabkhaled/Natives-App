import { IonBadge, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { PointsLedgerListProps } from './points-ledger-list.types';

/**
 * The append-only ledger. Awards, reversals, and adjustments each occupy
 * their own row with their own signed amount — an earlier total is never
 * rewritten, so the history stays auditable.
 */
export function PointsLedgerList(props: PointsLedgerListProps): React.JSX.Element {
  return (
    <ul data-testid={TEST_IDS.pointsLedger} aria-label={props.caption} className="app-ledger">
      {props.entries.map((entry) => (
        <li
          key={entry.id}
          data-testid={TEST_IDS.pointsLedgerEntry}
          className="app-surface-card app-ledger__row"
        >
          <div className="app-ledger__lead">
            <IonBadge color={entry.typeTone}>{entry.typeLabel}</IonBadge>
            <span className="app-ledger__amount">{entry.amountText}</span>
          </div>
          <div className="app-ledger__body">
            <p className="app-ledger__reason m-0">{entry.reasonText}</p>
            <IonNote>
              {entry.categoryLabel === null
                ? `${entry.sourceLabel} · ${entry.dateLabel}`
                : `${entry.sourceLabel} · ${entry.categoryLabel} · ${entry.dateLabel}`}
            </IonNote>
            <IonNote>{entry.ruleVersionLabel}</IonNote>
          </div>
        </li>
      ))}
    </ul>
  );
}
