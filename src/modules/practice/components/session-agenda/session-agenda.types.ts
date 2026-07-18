import type { PracticeAgendaItemView } from '../../types/practice-view.types';

export interface SessionAgendaProps {
  readonly heading: string;
  readonly emptyLabel: string;
  readonly items: readonly PracticeAgendaItemView[];
}
