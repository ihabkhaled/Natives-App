import { PublicCompetitionDetailView } from '../components/public-competition-detail-view';
import { usePublicCompetitionDetailScreen } from '../hooks/use-public-competition-detail.hook';

/** One public competition page: view model in, presentational component out. */
export function PublicCompetitionDetailContainer(): React.JSX.Element {
  const screen = usePublicCompetitionDetailScreen();
  return <PublicCompetitionDetailView {...screen} />;
}
