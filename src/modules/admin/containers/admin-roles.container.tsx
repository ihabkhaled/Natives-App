import { AdminRolesView } from '../components/admin-roles-view';
import { useAdminRoles } from '../hooks/use-admin-roles.hook';

/** RBAC role assignment inside the acting principal's ceiling. */
export function AdminRolesContainer(): React.JSX.Element {
  const view = useAdminRoles();
  return <AdminRolesView {...view} />;
}
