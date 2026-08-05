import { DrillDetailView } from '../components/drill-detail-view';
import { useDrillDetailScreen } from '../hooks/use-drill-detail-screen.hook';

/** Routed drill detail/edit (and create) screen. */
export function DrillDetailContainer(): React.JSX.Element {
  const view = useDrillDetailScreen();
  return <DrillDetailView {...view} />;
}
