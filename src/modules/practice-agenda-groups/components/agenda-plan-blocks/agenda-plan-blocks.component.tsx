import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { AgendaPlanBlocksProps } from './agenda-plan-blocks.types';

/**
 * The plan resolved: every station next to the group it belongs to. Read-only
 * — editing a block or a station is `practice-agenda`'s command, not this
 * screen's; this is the coach checking the split they just made against the
 * session it actually runs.
 */
export function AgendaPlanBlocks(props: AgendaPlanBlocksProps): React.JSX.Element {
  return (
    <section aria-label={props.heading} data-testid={TEST_IDS.practiceAgendaGroupsPlan}>
      <h2 className="app-section-panel__title m-0">{props.heading}</h2>
      {props.blocks.length === 0 ? (
        <IonText color="medium">
          <p className="m-0 text-sm" data-testid={TEST_IDS.practiceAgendaGroupsPlanEmpty}>
            {props.emptyLabel}
          </p>
        </IonText>
      ) : (
        <ul className="app-agenda-block-list m-0 flex list-none flex-col gap-3 p-0">
          {props.blocks.map((block) => (
            <li
              key={block.id}
              className="app-agenda-block flex flex-col gap-2"
              data-testid={TEST_IDS.practiceAgendaGroupsBlockRow}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-sm font-semibold">{block.title}</h3>
                {block.durationLabel === null ? null : (
                  <StatusChip label={block.durationLabel} tone="medium" />
                )}
              </div>
              {block.stations.length === 0 ? null : (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {block.stations.map((station) => (
                    <li key={station.id} className="flex flex-wrap items-center gap-2 text-sm">
                      <span>{station.name}</span>
                      <StatusChip label={station.groupLabel} tone="tertiary" />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
