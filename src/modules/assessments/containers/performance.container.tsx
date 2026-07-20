import { PerformanceView } from '../components/performance-view';
import { usePerformanceScreen } from '../hooks/use-performance-screen.hook';

/** The player performance screen. */
export function PerformanceContainer(): React.JSX.Element {
  const view = usePerformanceScreen();
  return <PerformanceView {...view} />;
}
