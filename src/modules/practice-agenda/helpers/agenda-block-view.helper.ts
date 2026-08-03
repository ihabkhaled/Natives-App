import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { AgendaBlock, AgendaStation } from '../types/practice-agenda.types';
import type { AgendaBlockRowView, AgendaStationRowView } from '../types/practice-agenda-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** Stations run in `position` order, same as the blocks that hold them. */
function toStationView(station: AgendaStation): AgendaStationRowView {
  return {
    id: station.id,
    blockId: station.blockId,
    name: station.name,
    detail: station.target,
  };
}

/**
 * The plan as rows, in the order given — never re-sorted here, because the
 * caller has already decided whether it is showing the server's order or the
 * coach's provisional one.
 *
 * `title`, `notes` and a station's `name`/`target` are the coach's own words
 * and are rendered verbatim. A missing duration stays null rather than
 * becoming "0 min": the backend distinguishes an untimed block from a
 * zero-length one, and so does the plan.
 */
export function buildAgendaBlockViews(
  t: Translate,
  blocks: readonly AgendaBlock[],
): readonly AgendaBlockRowView[] {
  return blocks.map((block) => ({
    id: block.id,
    title: block.title,
    durationLabel:
      block.durationMinutes === null
        ? null
        : t(I18N_KEYS.practice.agendaDuration, { minutes: block.durationMinutes }),
    notes: block.notes,
    stations: [...block.stations]
      .sort((left, right) => left.position - right.position)
      .map(toStationView),
  }));
}
