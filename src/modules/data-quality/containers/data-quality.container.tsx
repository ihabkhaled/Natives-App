import { DataQualityView } from '../components/data-quality-view';
import { useDataQualityScreen } from '../hooks/use-data-quality-screen.hook';

/** Composes the data-quality operations queue. */
export function DataQualityContainer(): React.JSX.Element {
  const view = useDataQualityScreen();

  return <DataQualityView {...view} />;
}
