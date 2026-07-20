import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { SectionPanel } from '@/shared/ui';

import type { SquadRosterPanelProps } from './squad-roster-panel.types';

/**
 * The complete match-day roster preview: every selected player appears, with
 * unknown numbers spelled out rather than printed as zero. The pending notice
 * states plainly that no roster endpoint is published yet.
 */
export function SquadRosterPanel(props: SquadRosterPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.squadRosterPanel}>
      <p
        data-testid={TEST_IDS.squadRosterPendingNotice}
        className="app-roster__pending m-0"
        role="note"
      >
        {view.pendingNotice}
      </p>
      {view.rows.length === 0 ? (
        <IonNote>{view.emptyLabel}</IonNote>
      ) : (
        <div className="app-roster__scroll">
          <table className="app-roster__table">
            <caption className="sr-only">{view.heading}</caption>
            <thead>
              <tr>
                {view.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.membershipId} data-testid={TEST_IDS.squadRosterRow}>
                  <th scope="row">{row.fullName}</th>
                  <td>{row.jerseyLabel}</td>
                  <td>{row.roleLabel}</td>
                  <td>{row.availabilityLabel}</td>
                  <td>{row.attendanceLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <IonNote>{view.exportNote}</IonNote>
    </SectionPanel>
  );
}
