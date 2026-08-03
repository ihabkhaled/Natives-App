import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { AgendaBlockRowProps } from './agenda-block-row.types';

/**
 * One block of the plan: what it is called, how long it runs, and the stations
 * inside it.
 *
 * The title, notes and station names are the coach's own words, rendered
 * verbatim. A block with no duration shows no chip at all — an untimed block
 * and a zero-minute one are different things.
 */
export function AgendaBlockRow(props: AgendaBlockRowProps): React.JSX.Element {
  const { view } = props;
  return (
    <div className="app-agenda-block flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="m-0 text-sm font-semibold">{view.title}</h3>
        {view.durationLabel === null ? null : (
          <StatusChip label={view.durationLabel} tone="medium" />
        )}
      </div>

      {view.notes === null ? null : (
        <IonText color="medium">
          <p className="m-0 text-sm">{view.notes}</p>
        </IonText>
      )}

      <ul className="app-agenda-block__stations m-0 flex list-none flex-col gap-1 p-0">
        {view.stations.map((station) => (
          <li key={station.id} className="flex flex-wrap items-center gap-2">
            <IonText>
              <span className="text-sm">{station.name}</span>
            </IonText>
            {station.detail === null ? null : (
              <IonText color="medium">
                <span className="text-xs">{station.detail}</span>
              </IonText>
            )}
            {props.canEdit ? (
              <AppButton
                label={props.removeStationLabel}
                tone="ghost"
                testId={`${TEST_IDS.practiceAgendaAction}-${station.id}`}
                onClick={() => {
                  props.onRemoveStation(station.blockId, station.id);
                }}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
