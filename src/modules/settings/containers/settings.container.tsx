import { SettingsView } from '../components/settings-view';
import { useSettingsScreen } from '../hooks/use-settings-screen.hook';

export function SettingsContainer(): React.JSX.Element {
  const view = useSettingsScreen();
  return <SettingsView {...view} />;
}
