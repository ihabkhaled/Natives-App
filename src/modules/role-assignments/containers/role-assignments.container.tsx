import { RoleAssignmentsView } from '../components/role-assignments-view';
import { useRoleAssignmentsScreen } from '../hooks/use-role-assignments-screen.hook';

/** Composes the RBAC role-assignments admin screen. */
export function RoleAssignmentsContainer(): React.JSX.Element {
  const view = useRoleAssignmentsScreen();

  return <RoleAssignmentsView {...view} />;
}
