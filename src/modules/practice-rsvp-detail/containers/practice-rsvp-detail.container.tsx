import { useRouteParam } from '@/packages/router';

import { RsvpDetailView } from '../components/rsvp-detail-view';
import { useRsvpDetailScreen } from '../hooks/use-rsvp-detail-screen.hook';
import { PRACTICE_RSVP_DETAIL_SESSION_ID_PARAM } from '../routes/practice-rsvp-detail.paths';

/** Routed RSVP-detail screen; the session id comes from the deep link. */
export function PracticeRsvpDetailContainer(): React.JSX.Element {
  const sessionId = useRouteParam(PRACTICE_RSVP_DETAIL_SESSION_ID_PARAM) ?? '';
  const view = useRsvpDetailScreen(sessionId);
  return <RsvpDetailView {...view} />;
}
