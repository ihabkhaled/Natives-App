import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { SettingsView } from '../components/settings-view';
import { useSettingsScreen } from '../hooks/use-settings-screen.hook';

export function SettingsContainer(): React.JSX.Element {
  const { title, ...view } = useSettingsScreen();
  return (
    <PageShell title={title} testId={TEST_IDS.settingsPage}>
      <SettingsView {...view} />
    </PageShell>
  );
}
