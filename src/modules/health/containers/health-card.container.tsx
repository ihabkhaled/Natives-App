import { HealthStatusCard } from '../components/health-status-card';
import { useHealthCard } from '../hooks/use-health-card.hook';

/** Embeddable health card (used by the home screen). */
export function HealthCardContainer(): React.JSX.Element {
  const view = useHealthCard();
  return <HealthStatusCard {...view} />;
}
