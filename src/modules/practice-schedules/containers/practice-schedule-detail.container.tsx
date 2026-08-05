import { useRouteParam } from '@/packages/router';

import { PracticeScheduleDetailView } from '../components/practice-schedule-detail-view';
import { usePracticeScheduleDetailScreen } from '../hooks/use-practice-schedule-detail-screen.hook';
import { PRACTICE_SCHEDULE_ID_PARAM } from '../routes/practice-schedules.paths';

/**
 * Routed create/edit screen. This container also serves the literal
 * `/practice-schedules/new` route, where `:scheduleId` never matches and
 * `useRouteParam` returns `null` — the hook reads that as create mode.
 */
export function PracticeScheduleDetailContainer(): React.JSX.Element {
  const scheduleId = useRouteParam(PRACTICE_SCHEDULE_ID_PARAM);
  const view = usePracticeScheduleDetailScreen(scheduleId);
  return <PracticeScheduleDetailView {...view} />;
}
