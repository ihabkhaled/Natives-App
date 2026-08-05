import type { WeekdayOptionView } from '../../types/practice-schedules-view.types';

export interface WeekdayPickerProps {
  readonly label: string;
  readonly options: readonly WeekdayOptionView[];
  readonly onToggle: (day: number) => void;
  readonly testId?: string;
}
