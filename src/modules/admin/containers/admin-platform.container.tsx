import { PlatformAdminsView } from '../components/platform-admins-view';
import { usePlatformAdmins } from '../hooks/use-platform-admins.hook';

/** Platform super-admin management: roster, audited promote, guarded revoke. */
export function AdminPlatformContainer(): React.JSX.Element {
  const view = usePlatformAdmins();
  return <PlatformAdminsView {...view} />;
}
