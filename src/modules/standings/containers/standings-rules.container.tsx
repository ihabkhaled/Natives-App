import { StandingsRulesScreen } from '../components/standings-rules-view';
import { useStandingsRules } from '../hooks/use-standings-rules.hook';

/** The versioned point-rules screen. */
export function StandingsRulesContainer(): React.JSX.Element {
  const view = useStandingsRules();
  return <StandingsRulesScreen {...view} />;
}
