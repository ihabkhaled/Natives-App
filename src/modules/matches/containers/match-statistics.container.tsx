import { MatchStatisticsView } from '../components/match-statistics-view';
import { useMatchStatisticsScreen } from '../hooks/use-match-statistics-screen.hook';

export function MatchStatisticsContainer(): React.JSX.Element {
  const view = useMatchStatisticsScreen();
  return <MatchStatisticsView {...view} />;
}
