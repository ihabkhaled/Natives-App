import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { AdminView } from '../components/admin-view';
import { useAdminScreen } from '../hooks/use-admin-screen.hook';

export function AdminContainer(): React.JSX.Element {
  const screen = useAdminScreen();
  return (
    <PageShell title={screen.title} testId={TEST_IDS.adminPage}>
      <AdminView heading={screen.heading} description={screen.description} />
    </PageShell>
  );
}
