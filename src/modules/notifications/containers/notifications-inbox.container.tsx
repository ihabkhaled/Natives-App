import { NotificationsInboxView } from '../components/notifications-inbox-view';
import { useNotificationsInbox } from '../hooks/use-notifications-inbox.hook';

/** The in-app notification inbox screen. */
export function NotificationsInboxContainer(): React.JSX.Element {
  const view = useNotificationsInbox();
  return <NotificationsInboxView {...view} />;
}
