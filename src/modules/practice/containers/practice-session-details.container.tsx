import { useRouteParam } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { PracticeSessionDetailsView } from '../components/practice-session-details-view';
import { usePracticeSessionDetails } from '../hooks/use-practice-session-details.hook';
import { PRACTICE_SESSION_ID_PARAM } from '../routes/practice.paths';

/** Routed practice session-detail screen; the id comes from the deep link. */
export function PracticeSessionDetailsContainer(): React.JSX.Element {
  const sessionId = useRouteParam(PRACTICE_SESSION_ID_PARAM) ?? '';
  const view = usePracticeSessionDetails(sessionId);
  return (
    <PageShell title={view.title} testId={TEST_IDS.practiceSessionPage}>
      <PracticeSessionDetailsView {...view} />
    </PageShell>
  );
}
