import { GovernanceView } from '../components/governance-view';
import { useGovernanceScreen } from '../hooks/use-governance-screen.hook';

/** Composes the board governance screen. */
export function GovernanceContainer(): React.JSX.Element {
  const view = useGovernanceScreen();

  return <GovernanceView {...view} />;
}
