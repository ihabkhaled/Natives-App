import { AttendanceView } from '../components/attendance-view';
import { useAttendanceRouteScreen } from '../hooks/use-attendance-route-screen.hook';

export function AttendanceContainer(): React.JSX.Element {
  const view = useAttendanceRouteScreen();
  return <AttendanceView {...view} />;
}
