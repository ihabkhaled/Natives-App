import type { AgendaBlockRowView } from '../../types/practice-agenda-view.types';

export interface AgendaBlockListProps {
  readonly blocks: readonly AgendaBlockRowView[];
  readonly ariaLabel: string;
  readonly moveUpLabel: string;
  readonly moveDownLabel: string;
  readonly removeStationLabel: string;
  readonly canEdit: boolean;
  readonly isSaving: boolean;
  readonly onMoveBlock: (index: number, offset: -1 | 1) => void;
  readonly onRemoveStation: (blockId: string, stationId: string) => void;
}
