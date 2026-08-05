import type { ScheduleRowView } from '../../types/practice-schedules-view.types';

export interface ScheduleRowProps {
  readonly item: ScheduleRowView;
  readonly onOpen: (scheduleId: string) => void;
}
