import { CompetitionDetailView } from '../components/competition-detail-view';
import { useCompetitionDetail } from '../hooks/use-competition-detail.hook';

/** One competition with its stages, fixtures, and opponents. */
export function CompetitionDetailContainer(): React.JSX.Element {
  const view = useCompetitionDetail();
  return <CompetitionDetailView {...view} />;
}
