import { AdminSettingsView } from '../components/admin-settings-view';
import { useAdminSettings } from '../hooks/use-admin-settings.hook';

/** Team settings, seasons, venues, and reference catalogs. */
export function AdminSettingsContainer(): React.JSX.Element {
  const view = useAdminSettings();
  return <AdminSettingsView {...view} />;
}
