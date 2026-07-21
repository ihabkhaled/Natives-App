import { AdminOperationsView } from '../components/admin-operations-view';
import { useOperationsCentre } from '../hooks/use-operations-centre.hook';

/** The operations centre: delivery health, failed work, and the audit log. */
export function AdminOperationsContainer(): React.JSX.Element {
  const view = useOperationsCentre();
  return <AdminOperationsView {...view} />;
}
