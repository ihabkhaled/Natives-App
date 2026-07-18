import { PracticeCalendarView } from '../components/practice-calendar-view';
import { usePracticeCalendar } from '../hooks/use-practice-calendar.hook';

/** Routed practice calendar screen. */
export function PracticeCalendarContainer(): React.JSX.Element {
  const view = usePracticeCalendar();
  return <PracticeCalendarView {...view} />;
}
