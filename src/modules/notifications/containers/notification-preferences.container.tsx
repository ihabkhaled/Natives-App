import { NotificationPreferencesView } from '../components/notification-preferences-view';
import { useNotificationPreferences } from '../hooks/use-notification-preferences.hook';

/** The per-category notification preference screen. */
export function NotificationPreferencesContainer(): React.JSX.Element {
  const view = useNotificationPreferences();
  return <NotificationPreferencesView {...view} />;
}
