import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { AdminHubView } from '../components/admin-hub-view';
import { useAdminHub } from '../hooks/use-admin-hub.hook';

/** The admin hub screen. */
export function AdminContainer(): React.JSX.Element {
  const view = useAdminHub();
  return (
    <PageShell title={view.title} testId={TEST_IDS.adminPage}>
      <AdminHubView {...view} />
    </PageShell>
  );
}
