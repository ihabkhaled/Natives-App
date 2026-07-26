import { AchievementsScreen } from '../components/achievements-view';
import { useAchievementsWorkspace } from '../hooks/use-achievements-workspace.hook';

/** The achievements approval workspace. */
export function AchievementsContainer(): React.JSX.Element {
  const view = useAchievementsWorkspace();
  return <AchievementsScreen {...view} />;
}
