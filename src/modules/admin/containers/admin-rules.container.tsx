import { AdminRulesView } from '../components/admin-rules-view';
import { useRulesWorkspace } from '../hooks/use-rules-workspace.hook';

/** Points and calculation rule version governance. */
export function AdminRulesContainer(): React.JSX.Element {
  const view = useRulesWorkspace();
  return <AdminRulesView {...view} />;
}
