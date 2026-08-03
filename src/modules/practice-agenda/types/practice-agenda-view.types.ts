import type { AsyncViewStatus } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

/** One station under a block, as the plan shows it. */
export interface AgendaStationRowView {
  readonly id: string;
  readonly blockId: string;
  /** The coach's own words for the station; never backend copy. */
  readonly name: string;
  readonly detail: string | null;
}

/** One block of the plan, in the order it runs. */
export interface AgendaBlockRowView {
  readonly id: string;
  readonly title: string;
  readonly durationLabel: string | null;
  readonly notes: string | null;
  readonly stations: readonly AgendaStationRowView[];
}

export interface PracticeAgendaScreenView extends ScreenCopy {
  readonly path: string;
  readonly pageTitle: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly listHeading: string;
  readonly listIntro: string;
  readonly countLabel: string;
  readonly moveUpLabel: string;
  readonly moveDownLabel: string;
  readonly removeStationLabel: string;
  /** False for a coach who may read the plan but not change it. */
  readonly canEdit: boolean;
  /** True while a move is in flight; the plan already shows the new order. */
  readonly isSaving: boolean;
  readonly notice: string | null;
  readonly blocks: readonly AgendaBlockRowView[];
  readonly onMoveBlock: (index: number, offset: -1 | 1) => void;
  readonly onRemoveStation: (blockId: string, stationId: string) => void;
}
