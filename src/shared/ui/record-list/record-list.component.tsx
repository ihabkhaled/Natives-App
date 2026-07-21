import { IonNote, IonText } from '@/packages/ionic';

import { StatusChip } from '../status-chip';
import type { RecordListProps } from './record-list.types';

/**
 * The canonical bounded record list: one label/value row per entry, with an
 * optional secondary line and an optional state chip. Configuration,
 * governance, and operations screens all render through it so a versioned
 * setting, a rule entry, and an audit line keep the same rhythm.
 */
export function RecordList(props: RecordListProps): React.JSX.Element {
  return (
    <ul data-testid={props.testId} aria-label={props.ariaLabel} className="app-record-list">
      {props.rows.map((row) => (
        <li key={row.key} data-testid={props.rowTestId} className="app-record-list__row">
          <div className="app-record-list__main">
            <IonText>
              <p className="app-record-list__label m-0">{row.label}</p>
            </IonText>
            <IonText>
              <p className="app-record-list__value m-0">{row.value}</p>
            </IonText>
            {row.detail === undefined || row.detail === null ? null : (
              <IonNote>{row.detail}</IonNote>
            )}
          </div>
          {row.tone === undefined || row.tone === null ? null : (
            <StatusChip label={row.value} tone={row.tone} srPrefix={row.label} />
          )}
        </li>
      ))}
    </ul>
  );
}
