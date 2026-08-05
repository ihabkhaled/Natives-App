import type { GroupRowView } from '../../types/practice-agenda-groups-view.types';

export interface AgendaGroupListProps {
  readonly heading: string;
  readonly emptyLabel: string;
  readonly groups: readonly GroupRowView[];
}
