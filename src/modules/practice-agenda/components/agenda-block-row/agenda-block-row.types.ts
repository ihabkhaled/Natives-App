import type { AgendaBlockRowView } from '../../types/practice-agenda-view.types';

export interface AgendaBlockRowProps {
  readonly view: AgendaBlockRowView;
  readonly removeStationLabel: string;
  /** False hides the station remove control rather than showing it disabled. */
  readonly canEdit: boolean;
  readonly onRemoveStation: (blockId: string, stationId: string) => void;
}
