import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel } from '@/shared/ui';

import type { RosterEntryTableProps } from './roster-entry-table.types';

/**
 * The roster table. Jersey, role, line, position, division, and availability
 * all render, and every unrecorded value is spelled out rather than zeroed.
 */
export function RosterEntryTable(props: RosterEntryTableProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel
      heading={view.entriesHeading}
      intro={view.entriesIntro}
      testId={TEST_IDS.rosterEntriesPanel}
    >
      {view.entries.length === 0 ? (
        <IonNote>{view.entriesEmptyLabel}</IonNote>
      ) : (
        <div className="app-roster__scroll">
          <table className="app-roster__table">
            <caption className="sr-only">{view.entriesHeading}</caption>
            <thead>
              <tr>
                {view.entriesColumns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.entries.map((entry) => (
                <tr key={entry.entryId} data-testid={TEST_IDS.rosterEntryRow}>
                  <th scope="row">
                    {entry.membershipId}
                    {entry.overrideNote === null ? null : (
                      <IonNote className="app-roster__note">{entry.overrideNote}</IonNote>
                    )}
                  </th>
                  <td>{entry.jerseyLabel}</td>
                  <td>{entry.roleLabel}</td>
                  <td>{entry.lineLabel}</td>
                  <td>{entry.positionLabel}</td>
                  <td>{entry.divisionLabel}</td>
                  <td>{entry.availabilityLabel}</td>
                  <td>
                    {entry.isRemovable ? (
                      <AppButton
                        label={entry.removeLabel}
                        tone="ghost"
                        testId={TEST_IDS.rosterEntryRemove}
                        onClick={() => {
                          props.onRemove(entry.membershipId);
                        }}
                      />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionPanel>
  );
}
