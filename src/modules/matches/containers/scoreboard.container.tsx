import { ScoreboardView } from '../components/scoreboard-view';
import { useScoreboardScreen } from '../hooks/use-scoreboard-screen.hook';

export function ScoreboardContainer(): React.JSX.Element {
  const view = useScoreboardScreen();
  return <ScoreboardView {...view} />;
}
