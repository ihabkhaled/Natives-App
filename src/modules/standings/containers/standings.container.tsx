import { StandingsScreen } from '../components/standings-view';
import { useStandingsTable } from '../hooks/use-standings-table.hook';

/** The competition standings screen. */
export function StandingsContainer(): React.JSX.Element {
  const view = useStandingsTable();
  return <StandingsScreen {...view} />;
}
