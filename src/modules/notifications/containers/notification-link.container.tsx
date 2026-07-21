import { Redirect } from '@/packages/router';

import { NotificationLinkView } from '../components/notification-link-view';
import { useNotificationLink } from '../hooks/use-notification-link.hook';

/**
 * Deep-link arrival. The redirect only renders once the hook's authorization
 * re-check passed; every other outcome falls through to a designed state that
 * carries no target content.
 */
export function NotificationLinkContainer(): React.JSX.Element {
  const view = useNotificationLink();
  return view.redirectPath === null ? (
    <NotificationLinkView {...view} />
  ) : (
    <Redirect to={view.redirectPath} />
  );
}
