import { PointsHistoryScreen } from '../components/points-history-view';
import { usePointsHistory } from '../hooks/use-points-history.hook';

/** The personal points ledger screen. */
export function PointsHistoryContainer(): React.JSX.Element {
  const view = usePointsHistory();
  return <PointsHistoryScreen {...view} />;
}
