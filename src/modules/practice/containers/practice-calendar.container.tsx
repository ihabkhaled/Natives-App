import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { PracticeCalendarView } from '../components/practice-calendar-view';
import { usePracticeCalendar } from '../hooks/use-practice-calendar.hook';

/** Routed practice calendar screen. */
export function PracticeCalendarContainer(): React.JSX.Element {
  const view = usePracticeCalendar();
  return (
    <PageShell title={view.title} testId={TEST_IDS.practiceCalendarPage}>
      <PracticeCalendarView {...view} />
    </PageShell>
  );
}
